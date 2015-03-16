OF.UI.Forms.Validation = function() {};

/**
 * Remove all validation errors shown in the form
 * 
 * @param $form
 */
OF.UI.Forms.Validation.removeErrors = function ($form) {
	$form.find('.form-group').each(function() {
		var $this = $(this);
		$this.removeClass('has-error');
		if ($this.data("tooltip")) {
			$this.tooltip('destroy');
		}
	});
};

/**
 * Update the validation errors in the form
 * 
 * @param $form
 * @param errors
 */
OF.UI.Forms.Validation.updateErrors = function (form, errors) {
	function findError(fieldName) {
		for (var i=0; i < errors.length; i++) {
			var error = errors[i];
			if (error.field == fieldName) {
				return error;
			}
		}
		return null;
	}
	
	form.find('.form-group').each(function() {
		var formGroup = $(this);
		var inputField = formGroup.find(".form-control");
		if (inputField.length > 0) {
			var oldTooltip = formGroup.data("tooltip");
			var error = findError(inputField.attr("name"));
			if (error == null) {
				//remove error class
				formGroup.removeClass('has-error');
				if (oldTooltip) {
					//remove tooltip
					formGroup.tooltip('destroy');
				}
			} else {
				formGroup.addClass('has-error');
				var tooltipTitle = OF.UI.Forms.Validation._createErrorTooltipTitle(inputField, error);
				if (oldTooltip) {
					//update old tooltip
					oldTooltip.options.title = tooltipTitle;
				} else {
					//create new tooltip
					OF.UI.Forms.Validation.createErrorTooltipWithTitle(formGroup, tooltipTitle);
				}
			}
		}
	});
};

/**
 * Returns the message associated to the error with the specified field name.
 * If field name is not specified, than the generic form error message is returned.
 */
OF.UI.Forms.Validation.getFieldErrorMessage = function (errors, fieldName) {
	for (var i=0; i < errors.length; i++) {
		var error = errors[i];
		if ( ! fieldName && ! error.field || fieldName == error.field) {
			return error.defaultMessage;
		}
	}
	return null;
};

/**
 * Returns the error message associated to the error with no field name specified
 * or the one associated to the first error.
 */
OF.UI.Forms.Validation.getFormErrorMessage = function ($form, errors) {
	var genericErrorMessage = OF.UI.Forms.Validation.getFieldErrorMessage(errors);
	var errorMessage;
	if ( genericErrorMessage == null ) {
		var firstError = errors[0];
		var fieldName = firstError.field;
		var fieldErrorMessage = firstError.defaultMessage;
		var field = $form.find( '[name="' + fieldName + '"]' );
		var fieldLabel = OF.UI.Forms.getFieldLabel(field);
		errorMessage =  fieldLabel + " " + fieldErrorMessage;
	} else {
		errorMessage = genericErrorMessage;
	}
	return errorMessage;
};

/**
 * Create an error tooltip associated to a validation error
 * 
 * @param $field
 * @param error
 * @param fieldLabel (optional) if not specified, field label will be assigned using getFieldLabel function
 */
OF.UI.Forms.Validation.createErrorTooltip = function ($field, error, fieldLabel) {
	var title = OF.UI.Forms.Validation._createErrorTooltipTitle($field, error, fieldLabel);
	OF.UI.Forms.Validation.createErrorTooltipWithTitle($field, title);
};

OF.UI.Forms.Validation.createErrorTooltipWithTitle = function ($field, title) {
	var $parentModal = $field.closest('.modal');
	var container = $parentModal.length == 0 ? 'body': $parentModal; 
	
	var inputType = OF.UI.Forms.getInputType($field);
	var $targetField = inputType == 'hidden' ? $field.siblings('.form-control'): $field;
	
	$targetField.tooltip({
		title: title,
		container: container,
		template: '<div class="tooltip error"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
	});
};

OF.UI.Forms.Validation._createErrorTooltipTitle = function($field, error, fieldLabel) {
	if ( ! fieldLabel ) {
		fieldLabel = OF.UI.Forms.getFieldLabel($field);
	}
	var errorMessage;
	if (typeof error == "string") {
		errorMessage = error;
	} else if (error.hasOwnProperty("defaultMessage")) {
		errorMessage = error.defaultMessage;
	} else {
		errorMessage = "error";
	}
	var message = fieldLabel + " " + errorMessage;
	return message;
};
