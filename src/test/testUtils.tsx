
import { render, RenderOptions } from '@testing-library/react'
import { screen, fireEvent, waitFor } from '@testing-library/dom'
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

// Export everything from @testing-library/react
export * from '@testing-library/react'
// Export additional utilities from @testing-library/dom
export { screen, fireEvent, waitFor }
// Override the render function with our custom one
export { customRender as render }
