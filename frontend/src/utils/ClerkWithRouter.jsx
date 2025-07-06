import { ClerkProvider } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export function ClerkWithRouter({ children, ...props }) {
  const navigate = useNavigate();
  return (
    <ClerkProvider {...props} navigate={navigate}>
      {children}
    </ClerkProvider>
  );
}