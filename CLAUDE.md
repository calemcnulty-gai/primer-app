# CLAUDE.md - Primer App Reference

## Build/Test Commands
- Start app: `npm run start` or `npx expo start`
- Dev mode: `npm run start:dev` (APP_ENV=development)
- Production: `npm run start:prod` (APP_ENV=production)
- Run tests: `npm test`
- Run single test: `npm test -- -t "test name pattern"`
- Platform specific: `npm run ios` or `npm run android`
- Linting: `npm run lint`
- Reset project: `npm run reset-project`

## Code Style Guidelines
- **TypeScript**: Use strict typing with explicit interfaces/types
- **Components**: Functional components with PascalCase naming
- **Imports**: React/RN first, third-party next, local imports last (using @/ alias)
- **State Management**: Redux with typed hooks (useAppDispatch, useAppSelector)
- **Styling**: Theme-aware components with StyleSheet.create()
- **Error Handling**: try/catch blocks with descriptive error messages
- **Testing**: Jest with snapshot testing
- **Expo**: Use `npx expo install` for package management
- **File Structure**: Platform-specific files use .ios.tsx/.android.tsx extensions

## Cursor Rules
- New packages must be installed with `npx expo install` instead of npm/yarn