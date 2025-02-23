import {Router} from 'express';
import multer from 'multer';
import {pumpportalLaunchController} from '../controllers/pumpPortalController';

// Initialize multer to store uploads in ./uploads
const upload = multer({dest: 'uploads/'});

// Create a sub-router
const router = Router();

/**
 * This route expects:
 *   - a multipart/form-data POST
 *   - field name "image" for the actual file
 */
router.post('/launch', upload.single('image'), pumpportalLaunchController);

export {router as pumpportalRouter};
