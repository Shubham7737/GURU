import '../src/index.css';
import { AuthProvider } from '../src/context/AuthContext';

export const metadata = {
  title: 'GuruEdu',
  description: 'Learn Skills with Live Online Classes',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
