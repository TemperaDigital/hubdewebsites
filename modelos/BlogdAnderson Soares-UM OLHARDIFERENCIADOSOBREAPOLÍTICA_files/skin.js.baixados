/* global jQuery:false */
/* global FRIBBO_STORAGE:false */

(function() {
	"use strict";

	// Init skin-specific actions on first run
	// Attention! Don't forget to add the class "inited" and check it to prevent re-initialize the elements
	jQuery( document ).on(
		'action.ready_fribbo', function() {

            // mc4wp - id
            if (jQuery( '.mc4wp-form-fields' ).length > 0) {
                var count_mc4wp = 1;
                jQuery( '.mc4wp-form-fields' ).each(
                    function () {
                        jQuery(this).find('input[type="checkbox"]').each(
                            function () {
                                var id = jQuery(this).attr( 'id' );
                                if(id) {}
                                else {
                                    id = 'go';
                                }
                                jQuery(this).attr('id', id + count_mc4wp);
                                jQuery(this).next('label').attr('for', id + count_mc4wp);
                                count_mc4wp++;
                            });
                    });
            }

        }
	);

	// Init skin-specific hidden elements when their parent container becomes visible
	// Attention! Don't forget to add the class "inited" and check it to prevent re-initialize the elements
	jQuery( document ).on(
		'action.init_hidden_elements', function() {
            // mc4wp - id
            if (jQuery( '.mc4wp-form-fields' ).length > 0) {
                var count_mc4wp = 1;
                jQuery( '.mc4wp-form-fields' ).each(
                    function () {
                        jQuery(this).find('input[type="checkbox"]').each(
                            function () {
                                var id = jQuery(this).attr( 'id' );
                                if(id) {}
                                else {
                                    id = 'go';
                                }
                                jQuery(this).attr('id', id + count_mc4wp);
                                jQuery(this).next('label').attr('for', id + count_mc4wp);
                                count_mc4wp++;
                            });
                    });
            }
		}
	);

})();
