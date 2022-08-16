import { Router } from 'express';
import CustomHandler from '../../controllers/customHandler';
import articlesApi from './articles';
import commentsApi from './comments';

const routes = (router: Router) => {
    router.use(`/articles`, articlesApi(Router()));
    router.use(`/comments`, commentsApi(Router()));
    router.use(CustomHandler.notFoundHandler);
    router.use(CustomHandler.errorHandler);

    return router;
};

export default routes;
