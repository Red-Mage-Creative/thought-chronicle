import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationContext {
  searchTerm?: string;
  selectedType?: string;
  sortBy?: string;
  sortOrder?: string;
  viewMode?: string;
  scrollY?: number;
  [key: string]: any;
}

export const useNavigationState = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const saveContext = (currentPath: string, context: NavigationContext) => {
    sessionStorage.setItem(`nav-context-${currentPath}`, JSON.stringify(context));
  };

  const restoreContext = (path: string): NavigationContext | null => {
    const saved = sessionStorage.getItem(`nav-context-${path}`);
    return saved ? JSON.parse(saved) : null;
  };

  const navigateWithContext = (to: string, currentContext: NavigationContext) => {
    saveContext(location.pathname, currentContext);
    navigate(to, { 
      state: { 
        returnTo: location.pathname, 
        ...currentContext 
      } 
    });
  };

  const navigateBack = () => {
    const returnPath = (location.state as any)?.returnTo || '/entities';
    navigate(returnPath);
  };

  return { 
    saveContext, 
    restoreContext, 
    navigateWithContext, 
    navigateBack,
    currentState: location.state as NavigationContext | null
  };
};
