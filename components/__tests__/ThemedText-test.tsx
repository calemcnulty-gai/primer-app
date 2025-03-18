import * as React from 'react';
import renderer from 'react-test-renderer';

import { ThemedText } from '../ThemedText';
import { ThemeProvider } from '@/theme/ThemeProvider';

it(`renders correctly`, () => {
  const tree = renderer.create(
    <ThemeProvider>
      <ThemedText>Snapshot test!</ThemedText>
    </ThemeProvider>
  ).toJSON();

  expect(tree).toMatchSnapshot();
});
