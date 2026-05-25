/**
 * This is the default configuration file for the Superdesk application. By default,
 * the app will use the file with the name "superdesk.config.js" found in the current
 * working directory, but other files may also be specified using relative paths with
 * the SUPERDESK_CONFIG environment variable or the grunt --config flag.
 */
'use strict';

module.exports = function(grunt) {
    return {
        defaultRoute: '/liveblog',
        requiredMediaMetadata: ['headline', 'description_text', 'alt_text'],
        defaultTimezone: grunt.option('defaultTimezone') || process.env.DEFAULT_TIMEZONE || 'Africa/Johannesburg',
        profileLanguages: ['af', 'en', 'de', 'fr'],
        view: {
            dateformat: process.env.VIEW_DATE_FORMAT || 'DD/MM/YYYY',
            timeformat: process.env.VIEW_TIME_FORMAT || 'HH:mm',
        },
        langOverride: {
            af: {
                'Liveblog': 'Regstreekse blog',
                'General Settings': 'Algemene instellings',
                'Theme Manager': 'Temabestuur',
                'SIGN OUT': 'TEKEN UIT',
                'About': 'Oor',
                'Save': 'Stoor',
                'Cancel': 'Kanselleer',
                'Settings': 'Instellings',
                'Language': 'Taal',
                'Theme': 'Tema',
            },
        },
    };
};
