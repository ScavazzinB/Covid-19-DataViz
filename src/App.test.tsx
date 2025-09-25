import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('COVID-19 Dashboard Tests', () => {

  test('affiche le titre principal du dashboard', () => {
    render(<App />);
    const title = screen.getByText('COVID-19 Global Dashboard');
    expect(title).toBeInTheDocument();
  });

  test('affiche le footer avec les crédits', () => {
    render(<App />);
    expect(screen.getByText('📊 Données fournies par')).toBeInTheDocument();
    expect(screen.getByText('Johns Hopkins CSSE')).toBeInTheDocument();
  });

  test('affiche l\'indicateur de statut en direct', () => {
    render(<App />);
    const liveIndicator = screen.getByText('Live');
    expect(liveIndicator).toBeInTheDocument();
  });

  test('contient les composants principaux', () => {
    render(<App />);

    // Check for main sections using semantic queries
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  test('ne génère pas d\'erreurs console', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    render(<App />);
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

});