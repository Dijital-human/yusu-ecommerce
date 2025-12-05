/**
 * Blog Comments Component / Blog Şərhləri Komponenti
 * Displays and manages blog post comments / Blog yazısı şərhlərini göstərir və idarə edir
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { MessageCircle, Send, User } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { useSession } from "next-auth/react";

interface Comment {
  id: string;
  content: string;
  userId?: string;
  name?: string;
  email?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    image?: string;
  };
  replies?: Comment[];
}

interface BlogCommentsProps {
  postSlug: string;
  postId: string;
}

export function BlogComments({ postSlug, postId }: BlogCommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [postSlug]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog/${postSlug}/comments`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setComments(result.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    if (!session && (!name.trim() || !email.trim())) {
      alert("Please provide your name and email");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/blog/${postSlug}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          name: session ? undefined : name,
          email: session ? undefined : email,
          parentId: parentId || undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setContent("");
          setName("");
          setEmail("");
          setParentId(null);
          setReplyingTo(null);
          fetchComments();
        }
      } else {
        const result = await response.json();
        alert(result.error || "Failed to submit comment");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Failed to submit comment");
    } finally {
      setSubmitting(false);
    }
  };

  const startReply = (commentId: string, commentName: string) => {
    setParentId(commentId);
    setReplyingTo(commentName);
    setContent(`@${commentName} `);
  };

  const cancelReply = () => {
    setParentId(null);
    setReplyingTo(null);
    setContent("");
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const isReply = depth > 0;
    
    return (
      <div key={comment.id} className={isReply ? "ml-8 mt-4" : "mb-6"}>
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            {comment.user?.image ? (
              <Image
                src={comment.user.image}
                alt={comment.user.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-500" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-gray-900">
                  {comment.user?.name || comment.name || "Anonymous"}
                </div>
                <div className="text-sm text-gray-500">
                  {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => startReply(comment.id, comment.user?.name || comment.name || "Anonymous")}
                >
                  Reply
                </Button>
              )}
            </div>
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4">
                {comment.replies.map((reply) => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Comment Form / Şərh Formu */}
        <form onSubmit={handleSubmit} className="mb-8">
          {replyingTo && (
            <div className="mb-4 p-3 bg-orange-50 rounded-lg flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Replying to <strong>{replyingTo}</strong>
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={cancelReply}>
                Cancel
              </Button>
            </div>
          )}
          
          <div className="space-y-4">
            {!session && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!session}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={!session}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="content">Comment</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                placeholder="Write your comment..."
                rows={4}
              />
            </div>
            
            <Button type="submit" disabled={submitting}>
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "Submitting..." : parentId ? "Post Reply" : "Post Comment"}
            </Button>
          </div>
        </form>

        {/* Comments List / Şərhlər Siyahısı */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => renderComment(comment))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

