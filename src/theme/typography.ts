import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  display: { fontSize: 32, fontWeight: '800', letterSpacing: -0.6, lineHeight: 36 },
  numeric: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4, lineHeight: 30 },
  title: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2, lineHeight: 24 },
  subtitle: { fontSize: 14, fontWeight: '600', letterSpacing: 0, lineHeight: 19 },
  body: { fontSize: 14, fontWeight: '400', letterSpacing: 0, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '600', letterSpacing: 0.2, lineHeight: 16 },
  micro: { fontSize: 11, fontWeight: '500', letterSpacing: 0.2, lineHeight: 14 },
};
