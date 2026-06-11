import { useMemo } from 'react';

// Ajuste esse valor para caber na tela do seu design (ex: 800 caracteres por tela)
const CHARS_PER_PAGE = 850; 

export function usePagination(fullText: string[]) {
  const pages = useMemo(() => {
    const generatedPages: string[][] = [];
    let currentPage: string[] = [];
    let currentLength = 0;

    fullText.forEach((paragraph) => {
      // Se o parágrafo sozinho for maior que a página, ele quebra a regra, 
      // mas mantemos para não perder texto. Caso contrário, somamos.
      if (currentLength + paragraph.length > CHARS_PER_PAGE && currentPage.length > 0) {
        generatedPages.push(currentPage);
        currentPage = [paragraph];
        currentLength = paragraph.length;
      } else {
        currentPage.push(paragraph);
        currentLength += paragraph.length;
      }
    });

    // Adiciona a última página se sobrou algo
    if (currentPage.length > 0) {
      generatedPages.push(currentPage);
    }

    return generatedPages;
  }, [fullText]);

  return pages;
}