
export const printImage = async (imageUrl: string, imageName?: string) => {
  try {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      throw new Error('Unable to open print window. Please allow popups for this site.');
    }

    // Create the HTML content for printing
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Image${imageName ? ` - ${imageName}` : ''}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: white;
            }
            img {
              max-width: 100%;
              max-height: 100vh;
              object-fit: contain;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            @media print {
              body {
                padding: 0;
              }
              img {
                max-width: 100%;
                max-height: 100vh;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" alt="${imageName || 'Image'}" onload="window.print(); window.close();" />
        </body>
      </html>
    `;

    // Write content to the print window
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Fallback: if image doesn't load within 3 seconds, still show print dialog
    setTimeout(() => {
      if (!printWindow.closed) {
        printWindow.print();
        printWindow.close();
      }
    }, 3000);

  } catch (error) {
    console.error('Error printing image:', error);
    alert('Failed to print image. Please try again.');
  }
};
