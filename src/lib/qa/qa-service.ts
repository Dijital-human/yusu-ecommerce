/**
 * Q&A Service / Sual-Cavab Xidməti
 * Service functions for product Q&A / Məhsul Sual-Cavab üçün xidmət funksiyaları
 */

import { db } from '@/lib/db';
import { logger } from '@/lib/utils/logger';
import { sendEmail } from '@/lib/email';

/**
 * Get product questions / Məhsul suallarını al
 */
export async function getProductQuestions(
  productId: string,
  options: {
    page?: number;
    limit?: number;
    sortBy?: 'newest' | 'oldest' | 'most_helpful';
    status?: 'all' | 'answered' | 'unanswered';
  } = {}
) {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'newest',
      status = 'all',
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause / Where klauzasını qur
    const where: any = { productId };
    if (status === 'answered') {
      where.answers = { some: {} };
    } else if (status === 'unanswered') {
      where.answers = { none: {} };
    }

    // Build orderBy clause / OrderBy klauzasını qur
    let orderBy: any = {};
    if (sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sortBy === 'most_helpful') {
      orderBy = { helpfulCount: 'desc' };
    }

    const [questions, total] = await Promise.all([
      (db as any).productQuestion.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          answers: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
          _count: {
            select: {
              answers: true,
              votes: true,
            },
          },
        },
      }),
      (db as any).productQuestion.count({ where }),
    ]);

    return {
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Failed to get product questions / Məhsul suallarını almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Create product question / Məhsul sualı yarat
 */
export async function createProductQuestion(
  productId: string,
  userId: string,
  question: string
) {
  try {
    // Get product with seller info / Satıcı məlumatı ilə məhsulu al
    const product = await (db as any).product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error('Product not found / Məhsul tapılmadı');
    }

    const newQuestion = await (db as any).productQuestion.create({
      data: {
        productId,
        userId,
        question,
        status: 'pending',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
    });

    logger.info('Product question created / Məhsul sualı yaradıldı', {
      questionId: newQuestion.id,
      productId,
      userId,
    });

    // Send email notification to seller / Satıcıya email bildirişi göndər
    if (product.seller?.email) {
      try {
        const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://ulustore.com';
        const productUrl = `${baseUrl}/products/${productId}`;
        
        await sendEmail(
          product.seller.email,
          `New Question About Your Product / Məhsulunuz Haqqında Yeni Sual - ${product.name}`,
          `
            <h2>New Question / Yeni Sual</h2>
            <p>Hello ${product.seller.name || 'Seller'} / Salam ${product.seller.name || 'Satıcı'},</p>
            <p>A customer asked a question about your product "${product.name}" / Müştəri məhsulunuz "${product.name}" haqqında sual verdi:</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Question / Sual:</strong></p>
              <p>${question}</p>
            </div>
            <p><a href="${productUrl}" style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Product / Məhsula Bax</a></p>
          `,
          `New Question / Yeni Sual\n\nHello ${product.seller.name || 'Seller'} / Salam ${product.seller.name || 'Satıcı'},\n\nA customer asked a question about your product "${product.name}" / Müştəri məhsulunuz "${product.name}" haqqında sual verdi:\n\nQuestion / Sual: ${question}\n\nView product: ${productUrl}`
        );
      } catch (emailError) {
        logger.error('Failed to send question notification email / Sual bildirişi email-i göndərmək uğursuz oldu', emailError);
        // Don't fail the question creation if email fails / Email uğursuz olarsa sual yaratmanı uğursuz etmə
      }
    }

    return newQuestion;
  } catch (error) {
    logger.error('Failed to create product question / Məhsul sualı yaratmaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Create product answer / Məhsul cavabı yarat
 */
export async function createProductAnswer(
  questionId: string,
  userId: string,
  answer: string,
  isSeller: boolean = false
) {
  try {
    // Check if question exists with user and product info / Sualın istifadəçi və məhsul məlumatı ilə mövcud olub-olmadığını yoxla
    const question = await (db as any).productQuestion.findUnique({
      where: { id: questionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!question) {
      throw new Error('Question not found / Sual tapılmadı');
    }

    const newAnswer = await (db as any).productAnswer.create({
      data: {
        questionId,
        userId,
        answer,
        isSeller,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update question status / Sual statusunu yenilə
    await (db as any).productQuestion.update({
      where: { id: questionId },
      data: { status: 'answered' },
    });

    logger.info('Product answer created / Məhsul cavabı yaradıldı', {
      answerId: newAnswer.id,
      questionId,
      userId,
    });

    // Send email notification to question asker / Sual verənə email bildirişi göndər
    if (question.user?.email && question.user.id !== userId) {
      try {
        const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://ulustore.com';
        const productUrl = `${baseUrl}/products/${question.productId}`;
        
        await sendEmail(
          question.user.email,
          `Answer to Your Question / Sualınıza Cavab - ${question.product?.name || 'Product'}`,
          `
            <h2>Answer to Your Question / Sualınıza Cavab</h2>
            <p>Hello ${question.user.name || 'User'} / Salam ${question.user.name || 'İstifadəçi'},</p>
            <p>Someone answered your question about "${question.product?.name || 'the product'}" / Kimsə "${question.product?.name || 'məhsul'}" haqqında sualınıza cavab verdi:</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Your Question / Sualınız:</strong></p>
              <p>${question.question}</p>
              <p><strong>Answer / Cavab:</strong></p>
              <p>${answer}</p>
            </div>
            <p><a href="${productUrl}" style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Product / Məhsula Bax</a></p>
          `,
          `Answer to Your Question / Sualınıza Cavab\n\nHello ${question.user.name || 'User'} / Salam ${question.user.name || 'İstifadəçi'},\n\nSomeone answered your question about "${question.product?.name || 'the product'}" / Kimsə "${question.product?.name || 'məhsul'}" haqqında sualınıza cavab verdi:\n\nYour Question / Sualınız: ${question.question}\n\nAnswer / Cavab: ${answer}\n\nView product: ${productUrl}`
        );
      } catch (emailError) {
        logger.error('Failed to send answer notification email / Cavab bildirişi email-i göndərmək uğursuz oldu', emailError);
        // Don't fail the answer creation if email fails / Email uğursuz olarsa cavab yaratmanı uğursuz etmə
      }
    }

    return newAnswer;
  } catch (error) {
    logger.error('Failed to create product answer / Məhsul cavabı yaratmaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Vote on question / Suala səs ver
 */
export async function voteOnQuestion(
  questionId: string,
  userId: string,
  voteType: 'helpful' | 'not_helpful'
) {
  try {
    // Check if user already voted / İstifadəçinin artıq səs verib-vermədiyini yoxla
    const existingVote = await (db as any).questionVote.findUnique({
      where: {
        questionId_userId: {
          questionId,
          userId,
        },
      },
    });

    let vote;
    if (existingVote) {
      // Update existing vote / Mövcud səsi yenilə
      vote = await (db as any).questionVote.update({
        where: { id: existingVote.id },
        data: { voteType },
      });
    } else {
      // Create new vote / Yeni səs yarat
      vote = await (db as any).questionVote.create({
        data: {
          questionId,
          userId,
          voteType,
        },
      });
    }

    // Update helpful count / Faydalı sayını yenilə
    const helpfulCount = await (db as any).questionVote.count({
      where: {
        questionId,
        voteType: 'helpful',
      },
    });

    await (db as any).productQuestion.update({
      where: { id: questionId },
      data: { helpfulCount },
    });

    return vote;
  } catch (error) {
    logger.error('Failed to vote on question / Suala səs vermək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Vote on answer / Cavaba səs ver
 */
export async function voteOnAnswer(
  answerId: string,
  userId: string,
  voteType: 'helpful' | 'not_helpful'
) {
  try {
    // Check if user already voted / İstifadəçinin artıq səs verib-vermədiyini yoxla
    const existingVote = await (db as any).answerVote.findUnique({
      where: {
        answerId_userId: {
          answerId,
          userId,
        },
      },
    });

    let vote;
    if (existingVote) {
      // Update existing vote / Mövcud səsi yenilə
      vote = await (db as any).answerVote.update({
        where: { id: existingVote.id },
        data: { voteType },
      });
    } else {
      // Create new vote / Yeni səs yarat
      vote = await (db as any).answerVote.create({
        data: {
          answerId,
          userId,
          voteType,
        },
      });
    }

    // Update helpful count / Faydalı sayını yenilə
    const helpfulCount = await (db as any).answerVote.count({
      where: {
        answerId,
        voteType: 'helpful',
      },
    });

    await (db as any).productAnswer.update({
      where: { id: answerId },
      data: { helpfulCount },
    });

    return vote;
  } catch (error) {
    logger.error('Failed to vote on answer / Cavaba səs vermək uğursuz oldu', error);
    throw error;
  }
}

