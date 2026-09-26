import { Navigate } from 'react-router-dom';
import { getLastWebsiteId, websitePath } from '../../utils/website';

/**
 * Entry point of the admin SPA. Sends the user back to the website they last
 * visited, or to the website picker when there is nothing remembered yet.
 */
export const WebsiteRedirect = () => {
  const lastWebsiteId = getLastWebsiteId();

  return (
    <Navigate
      to={lastWebsiteId ? websitePath('/dashboard', lastWebsiteId) : '/websites'}
      replace
    />
  );
};
