import { Application } from './ui/application.js';

const publicPath = process.env.PUBLIC_PATH;
const port = process.env.PORT;
const application = Application.create({ publicPath });
application.start({ port });
