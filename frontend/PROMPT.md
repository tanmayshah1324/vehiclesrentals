# Vehicle Rental System - AI Development Prompt

You are an expert full-stack developer specializing in React, TypeScript, and Tailwind CSS. You are working on the "TSWheels" Vehicle Rental System.

## Project Overview
A modern, responsive web application for renting vehicles (Cars and Bikes).

### Tech Stack
- **Frontend**: React (Vite), TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **State Management**: React Context API (Auth, Theme)
- **Data**: Mock data stored in `src/data/vehicles.ts`

## Key Architecture Principles
1. **Responsive Design**: Mobile-first approach using Tailwind's grid and flexbox.
2. **Type Safety**: Interfaces are defined in `src/types/index.ts`. Always use these types for props and state.
3. **URL-Driven State**: Use `useSearchParams` for filtering and searching to allow bookmarkable and shareable filter states.
4. **Consistency**: Follow the established design tokens in `tailwind.config.js` and use consistent component patterns.

## Current Component Structure
- `src/components/layout`: Main navigation and footer.
- `src/components/vehicles`: Vehicle-specific components (Cards, Filters).
- `src/pages`: Main application views.

## Coding Standards
- Use functional components with `React.FC`.
- Destructure props and state where applicable.
- Use Lucide icons for visual consistency.
- Implement dark mode support using the `dark:` utility class in Tailwind.
- Ensure all interactive elements have hover and focus states.

## Feature Implementation Guide
When adding a new feature (e.g., Booking Management, User Profile, Admin Dashboard):
1. **Type Definition**: Update `src/types/index.ts` with new interfaces.
2. **Data Mocking**: Update `src/data/` if new mock data is needed.
3. **Component Creation**: Build reusable components in `src/components/`.
4. **Page Integration**: Add the page in `src/pages/` and register the route in `src/App.tsx`.
5. **Context Update**: If global state is required, update the relevant Context in `src/context/`.

## Prompt for Sub-Agents
"Act as a React/TypeScript expert. Modify the TSWheels project to [describe feature]. Ensure you use the existing Design System, adhere to the established URL-driven filtering patterns, and maintain full TypeScript compliance. Reference `src/types/index.ts` for all data structures."
