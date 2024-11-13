import { Application } from './ui/application.js';

const port = process.env.PORT;
const application = Application.create();
application.start({ port });
