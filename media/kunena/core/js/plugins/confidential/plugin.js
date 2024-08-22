/**
 * Kunena Component
 * @package Kunena.Media
 *
 * @copyright     Copyright (C) 2008 - 2023 Kunena Team. All rights reserved.
 * @license https://www.gnu.org/copyleft/gpl.html GNU/GPL
 * @link https://www.kunena.org
 **/

CKEDITOR.plugins.add( 'confidential', {
	icons: 'confidential',
	init: function( editor ) {
		editor.addCommand( 'insertConfidential', {
			exec: function( editor ) {
				var selectedtext = editor.getSelection().getSelectedText();
				editor.insertHtml( '[confidential]' + selectedtext + '[/confidential]' );
			}
		});
		editor.ui.addButton( 'Confidential', {
			label: Joomla.Text._('COM_KUNENA_EDITOR_CONFIDENTIAL'),
			command: 'insertConfidential',
			toolbar: 'insert'
		});
	}
});