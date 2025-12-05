/**
 * Button Component Tests / Button Komponent Testləri
 * This file tests the Button component functionality
 * Bu fayl Button komponentinin funksionallığını test edir
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button Component / Button Komponenti', () => {
  it('renders button with text / Düyməni mətn ilə render edir', () => {
    render(<Button>Test Button / Test Düyməsi</Button>)
    
    const button = screen.getByRole('button', { name: /test button/i })
    expect(button).toBeInTheDocument()
  })

  it('handles click events / Klik hadisələrini idarə edir', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click Me / Məni Bas</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies disabled state / Deaktiv vəziyyətini tətbiq edir', () => {
    render(<Button disabled>Disabled Button / Deaktiv Düymə</Button>)
    
    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toBeDisabled()
  })

  it('applies custom className / Xüsusi className tətbiq edir', () => {
    render(<Button className="custom-class">Custom Button / Xüsusi Düymə</Button>)
    
    const button = screen.getByRole('button', { name: /custom button/i })
    expect(button).toHaveClass('custom-class')
  })

  it('renders with different variants / Fərqli variantlarla render edir', () => {
    const { rerender } = render(<Button variant="primary">Primary / Əsas</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-orange-600')

    rerender(<Button variant="secondary">Secondary / İkincil</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-gray-600')

    rerender(<Button variant="outline">Outline / Kontur</Button>)
    expect(screen.getByRole('button')).toHaveClass('border-orange-600')
  })

  it('shows loading state / Yükləmə vəziyyətini göstərir', () => {
    render(<Button loading>Loading / Yüklənir</Button>)
    
    const button = screen.getByRole('button', { name: /loading/i })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50')
  })
})
