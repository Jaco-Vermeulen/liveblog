import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  LbCard,
  LbCardBody,
  LbCardEyebrow,
  LbCardFooter,
  LbCardHeader,
  LbCardSubtitle,
  LbCardTitle,
  LbFeatureCard,
  LbPanelCard,
} from './LbCard';

describe('LbCard', () => {
  it('renders compound header title and subtitle', () => {
    render(
      <LbCard>
        <LbCardHeader>
          <LbCardEyebrow>Section</LbCardEyebrow>
          <LbCardTitle>Card title</LbCardTitle>
          <LbCardSubtitle>Card subtitle</LbCardSubtitle>
        </LbCardHeader>
        <LbCardBody>Body content</LbCardBody>
        <LbCardFooter>Footer actions</LbCardFooter>
      </LbCard>,
    );

    expect(screen.getByText('Section')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Card title' })).toBeTruthy();
    expect(screen.getByText('Card subtitle')).toBeTruthy();
    expect(screen.getByText('Body content')).toBeTruthy();
    expect(screen.getByText('Footer actions')).toBeTruthy();
  });

  it('renders LbFeatureCard', () => {
    render(
      <LbFeatureCard
        icon={<span data-testid="icon">★</span>}
        title="Feature"
        description="Description text"
      />,
    );
    expect(screen.getByTestId('icon')).toBeTruthy();
    expect(screen.getByText('Feature')).toBeTruthy();
    expect(screen.getByText('Description text')).toBeTruthy();
  });

  it('renders LbPanelCard with actions', () => {
    render(
      <LbPanelCard
        title="Panel"
        subtitle="Sub"
        actions={<button type="button">Act</button>}
        footer={<span>Foot</span>}
      >
        Child
      </LbPanelCard>,
    );
    expect(screen.getByText('Panel')).toBeTruthy();
    expect(screen.getByText('Sub')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Act' })).toBeTruthy();
    expect(screen.getByText('Child')).toBeTruthy();
    expect(screen.getByText('Foot')).toBeTruthy();
  });
});
