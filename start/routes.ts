/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

// Landing Pages
router.on('/').render('pages/landing_page/lp')
router.on('/about').render('pages/landing_page/about_us')
router.on('/contact').render('pages/landing_page/contact_us')
