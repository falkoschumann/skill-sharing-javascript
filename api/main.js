// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { Application } from './ui/application.js';

const port = process.env.PORT;
const application = Application.create();
application.start({ port });
