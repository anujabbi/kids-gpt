
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { TooltipProvider } from '@/components/ui/tooltip'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
