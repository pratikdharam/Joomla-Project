/**
 * Kunena Component
 * @package Kunena.Media
 *
 * @copyright     Copyright (C) 2008 - 2023 Kunena Team. All rights reserved.
 * @license https://www.gnu.org/copyleft/gpl.html GNU/GPL
 * @link https://www.kunena.org
 **/

jQuery(function ($) {
    'use strict';

    $.widget('blueimp.fileupload', $.blueimp.fileupload, {
        options: {
            // The maximum width of resized images:
            imageMaxWidth: Joomla.getOptions('com_kunena.imageWidth'),
            // The maximum height of resized images:
            imageMaxHeight: Joomla.getOptions('com_kunena.imageHeight')
        }
    });

    // Insert bbcode in message
    function insertInMessage(attachid, filename, button) {
        CKEDITOR.instances.message.insertText(' [attachment=' + attachid + ']' + filename + '[/attachment]');

        if (button !== undefined) {
            button.removeClass('btn-primary');
            button.addClass('btn-success');
            button.html(Joomla.getOptions('com_kunena.icons.upload') + ' ' + Joomla.Text._('COM_KUNENA_EDITOR_IN_MESSAGE'));
        }
    }

    jQuery.fn.extend({
        insertAtCaret: function (myValue) {
            return this.each(function (i) {
                if (document.selection) {
                    //For browsers like Internet Explorer
                    this.focus();
                    //noinspection JSUnresolvedconstiable
                    let sel;
                    sel = document.selection.createRange();
                    sel.text = myValue;
                    this.focus();
                } else if (this.selectionStart || this.selectionStart === '0') {
                    //For browsers like Firefox and Webkit based
                    const startPos = this.selectionStart;
                    const endPos = this.selectionEnd;
                    const scrollTop = this.scrollTop;
                    this.value = this.value.substring(0, startPos) + myValue + this.value.substring(endPos, this.value.length);
                    this.focus();
                    this.selectionStart = startPos + myValue.length;
                    this.selectionEnd = startPos + myValue.length;
                    this.scrollTop = scrollTop;
                } else {
                    this.value += myValue;
                    this.focus();
                }
            })
        }
    });

    var fileCount = null;
    var filesedit = null;
    var fileeditinline = 0;

    $('#remove-all').on('click', function (e) {
        e.preventDefault();

        $('#progress').hide();

        $('#insert-all').removeClass('btn-success');
        $('#insert-all').addClass('btn-primary');
        $('#insert-all').html(Joomla.getOptions('com_kunena.icons.upload') + ' ' + Joomla.Text._('COM_KUNENA_UPLOADED_LABEL_INSERT_ALL_BUTTON'));

        $('#remove-all').hide();
        $('#insert-all').hide();

        const editor_text = CKEDITOR.instances.message.getData();

        // Removing items in edit if they are present
        if ($.isEmptyObject(filesedit) === false) {
            const filesidinedittodelete = [];

            $(filesedit).each(function (index, file) {
                if ($('#kattachs-' + file.id).length === 0) {
                    $('#kattach-list').append('<input id="kattachs-' + file.id + '" type="hidden" name="attachments[' + file.id + ']" value="1" />');
                }

                if ($('#kattach-' + file.id).length > 0) {
                    $('#kattach-' + file.id).remove();
                }

                filesidinedittodelete.push(file.id);
            });

            $.ajax({
                url: Joomla.getOptions('com_kunena.kunena_upload_files_rem') + '&files_id_delete=' + JSON.stringify(filesidinedittodelete) + '&editor_text=' + editor_text,
                type: 'POST'
            })
                .done(function (data) {
                    $('#files').empty();

                    if (data.text_prepared !== false) {
                        CKEDITOR.instances.message.setData(data.text_prepared);
                    }
                })
                .fail(function () {
                    //TODO: handle the error of ajax request
                });

            filesedit = null;
        }

        const child = $('#kattach-list').find('input');
        const filesidtodelete = [];

        child.each(function (i, el) {
            const elem = $(el);

            if (!elem.attr('id').match("[a-z]{8}")) {
                const fileid = elem.attr('id').match("[0-9]{1,8}");

                if ($('#kattachs-' + fileid).length === 0) {
                    $('#kattach-list').append('<input id="kattachs-' + fileid + '" type="hidden" name="attachments[' + fileid + ']" value="1" />');
                }

                if ($('#kattach-' + fileid).length > 0) {
                    $('#kattach-' + fileid).remove();
                }

                filesidtodelete.push(fileid);
            }
        });

        if (filesidtodelete.length !== 0) {
            $.ajax({
                url: Joomla.getOptions('com_kunena.kunena_upload_files_rem') + '&files_id_delete=' + JSON.stringify(filesidtodelete) + '&editor_text=' + editor_text,
                type: 'POST'
            })
                .done(function (data) {
                    $('#files').empty();

                    if (data.text_prepared !== false) {
                        CKEDITOR.instances.message.setData(data.text_prepared);
                    }
                })
                .fail(function () {
                    //TODO: handle the error of ajax request
                });
        }

        $('#alert_max_file').remove();

        fileCount = 0;
    });

    $('#insert-all').bind('keypress keydown keyup', function(e){
		if(e.keyCode == 13) { e.preventDefault(); }
	});

    $('#insert-all').on('click', function (e) {
        e.preventDefault();

        const child = $('#kattach-list').find('input');
        const files_id = [];
        let content_to_inject = '';

        child.each(function (i, el) {
            const elem = $(el);

            if (!elem.attr('id').match("[a-z]{8}")) {
                const attachid = elem.attr('id').match("[0-9]{1,8}");
                const filename = elem.attr('placeholder');

                content_to_inject += '[attachment=' + attachid + ']' + filename + '[/attachment]';

                $('#insert-all').removeClass('btn-primary');
                $('#insert-all').addClass('btn-success');
                $('#insert-all').html(Joomla.getOptions('com_kunena.icons.upload') + Joomla.Text._('COM_KUNENA_EDITOR_IN_MESSAGE'));

                files_id.push(attachid);
            }
        });

        // Inserting items in message from edit if they aren't already present
        if ($.isEmptyObject(filesedit) === false) {
            const filesid_list = [];

            $(filesedit).each(function (index, file) {
                if (file.inline !== true) {
                    content_to_inject += '[attachment=' + file.id + ']' + file.name + '[/attachment]';
                    files_id.push(file.id);
                }
            });
        }

		// Prevent the press on enter key to press the button enter all when previously clicked
		if ($('#message').length > 0)
		{
			CKEDITOR.instances.message.insertText(content_to_inject);
		}

        $('#files .btn.btn-primary').each(function () {
            $('#files .btn.btn-primary').addClass('btn-success');
            $('#files .btn.btn-success').removeClass('btn-primary');
            $('#files .btn.btn-success').html(Joomla.getOptions('com_kunena.icons.upload') + Joomla.Text._('COM_KUNENA_EDITOR_IN_MESSAGE'));
        });

        $.ajax({
            url: Joomla.getOptions('com_kunena.kunena_upload_files_set_inline') + '&files_id=' + JSON.stringify(files_id),
            type: 'POST'
        })
            .done(function (data) {

            })
            .fail(function () {
                //TODO: handle the error of ajax request
            });

        filesedit = null;
    });

    const insertButton = $('<button>')
        .addClass("btn btn-primary")
        .html(Joomla.getOptions('com_kunena.icons.upload') + ' ' + Joomla.Text._('COM_KUNENA_EDITOR_INSERT'))
        .on('click', function (e) {
            // Make sure the button click doesn't submit the form:
            e.preventDefault();
            e.stopPropagation();

            const $this = $(this),
                data = $this.data();

            let file_id = 0;
            let filename = null;
            if (data.result !== undefined) {
                file_id = data.result.data.id;
                filename = data.result.data.filename;
            } else {
                file_id = data.id;
                filename = data.name;
            }

            insertInMessage(file_id, filename, $this);

            const files_id = [];
            files_id.push(file_id);

            $.ajax({
                url: Joomla.getOptions('com_kunena.kunena_upload_files_set_inline') + '&files_id=' + JSON.stringify(files_id),
                type: 'POST'
            })
                .done(function (data) {

                })
                .fail(function () {
                    //TODO: handle the error of ajax request
                });
        });

    const removeButton = $('<button/>')
        .addClass('btn btn-danger')
        .attr('type', 'button')
        .html(Joomla.getOptions('com_kunena.icons.trash') + ' ' + Joomla.Text._('COM_KUNENA_GEN_REMOVE_FILE'))
        .on('click', function (e) {
            // Make sure the button click doesn't submit the form:
            e.preventDefault();
            e.stopPropagation();

            const $this = $(this),
                data = $this.data();

            $('#klabel_info_drop_browse').show();

            let file_id = 0;
            if (data.uploaded === true) {
                if (data.result !== false) {
                    file_id = data.result.data.id;
                } else {
                    file_id = data.file_id;
                }
            }

            if ($('#kattachs-' + file_id).length === 0) {
                $('#kattach-list').append('<input id="kattachs-' + file_id + '" type="hidden" name="attachments[' + file_id + ']" value="1" />');
            }

            if ($('#kattach-' + file_id).length > 0) {
                $('#kattach-' + file_id).remove();
            }

            fileCount = fileCount - 1;

            if (fileCount == 0) {
                $('#insert-all').hide();
                $('#remove-all').hide();
            }

            $('#alert_max_file').remove();
            const editor_text = CKEDITOR.instances.message.getData();

            const file_query_id = [];
            file_query_id.push(file_id);

            // Ajax Request to delete the file from filesystem
            $.ajax({
                url: Joomla.getOptions('com_kunena.kunena_upload_files_rem') + '&files_id_delete=' + JSON.stringify(file_query_id) + '&editor_text=' + editor_text,
                type: 'POST'
            })
                .done(function (data) {
                    $this.parent().remove();

                    if (data.text_prepared !== false) {
                        CKEDITOR.instances.message.setData(data.text_prepared);
                    }
                })
                .fail(function () {
                    //TODO: handle the error of ajax request
                });
        });

    $('#fileupload').fileupload({
        url: $('#kunena_upload_files_url').val(),
        dataType: 'json',
        autoUpload: true,
        // Enable image resizing, except for Android and Opera,
        // which actually support image resizing, but fail to
        // send Blob objects via XHR requests:
        disableImageResize: / Android( ?!.*Chrome) |Opera /
            .test(window.navigator.userAgent),
        previewMaxWidth: 100,
        previewMaxHeight: 100,
        previewCrop: true
    }).bind('fileuploadsubmit', function (e, data) {
        var params = {};
        $.each(data.files, function (index, file) {
            params = {
                'catid': $('#kunena_upload').val(),
                'filename': file.name,
                'size': file.size,
                'mime': file.type
            };
        });

        data.formData = params;
    })
        .bind('fileuploaddrop', function (e, data) {
            $('#form_submit_button').prop('disabled', true);

            $('#remove-all').show();
            $('#insert-all').show();

            $('#kattach_form').show();

            const filecoutntmp = Object.keys(data['files']).length + fileCount;

            if (filecoutntmp > Joomla.getOptions('com_kunena.kunena_upload_files_maxfiles')) {
                $('<div class="alert alert-danger" id="alert_max_file"><button class="close" type="button" data-dismiss="alert">×</button>' + Joomla.Text._('COM_KUNENA_UPLOADED_LABEL_ERROR_REACHED_MAX_NUMBER_FILES') + '</div>').insertBefore($('#files'));

                $('#form_submit_button').prop('disabled', false);

                return false;
            } else {
                fileCount = Object.keys(data['files']).length + fileCount;
            }
        })
        .bind('fileuploadchange', function (e, data) {
            $('#form_submit_button').prop('disabled', true);

            $('#remove-all').show();
            $('#insert-all').show();

            const filecoutntmp = Object.keys(data['files']).length + fileCount;

            if (filecoutntmp > Joomla.getOptions('com_kunena.kunena_upload_files_maxfiles')) {
                $('<div class="alert alert-danger" id="alert_max_file"><button class="close" type="button" data-dismiss="alert">×</button>' + Joomla.Text._('COM_KUNENA_UPLOADED_LABEL_ERROR_REACHED_MAX_NUMBER_FILES') + '</div>').insertBefore($('#files'));

                $('#form_submit_button').prop('disabled', false);

                return false;
            } else {
                fileCount = Object.keys(data['files']).length + fileCount;
            }
        })
        .on('fileuploadadd', function (e, data) {
            $('#progress-bar').css(
                'width',
                '0%'
            );

			$('#progress').show();

            data.context = $('<div/>').appendTo('#files');

            $.each(data.files, function (index, file) {
                const node = $('<p/>')
                    .append($('<span/>').text(file.name));
                if (!index) {
                    node
                        .append('<br>');
                }

                node.appendTo(data.context);
            });
        }).on('fileuploadprocessalways', function (e, data) {
        const index = data.index,
            file = data.files[index],
            node = $(data.context.children()[index]);
        if (file.preview) {
            node
                .prepend('<br>')
                .prepend(file.preview);
        }

        if (file.error) {
            node
                .append('<br>')
                .append($('<span class="text-danger"/>').text(file.error));
        }

        if (index + 1 === data.files.length) {
            data.context.find('button.btn-primary')
                .text(Joomla.Text._('COM_KUNENA_UPLOADED_LABEL_UPLOAD_BUTTON'))
                .prop('disabled', !!data.files.error);
        }
    }).on('fileuploaddone', function (e, data) {
        // $.each(data.result.data, function (index, file)
        const progress = parseInt(data.loaded / data.total * 100, 10);

        $('.progress-bar').css(
            'width',
            progress + '%'
        );

        $('.progress-bar').prop('aria-valuenow', progress);

        const link = $('<a>')
            .attr('target', '_blank')
            .prop('href', data.result.location);

        data.context.find('span')
            .wrap(link);

        if (data.result.success === true) {
            $('#form_submit_button').prop('disabled', false);

            // The attachment has been right uploaded, so now we need to put into input hidden to added to message
            $('#kattach-list').append('<input id="kattachs-' + data.result.data.id + '" type="hidden" name="attachments[' + data.result.data.id + ']" value="1" />');
            $('#kattach-list').append('<input id="kattach-' + data.result.data.id + '" placeholder="' + data.result.data.filename + '" type="hidden" name="attachment[' + data.result.data.id + ']" value="1" />');

            data.uploaded = true;

            data.context.append(insertButton.clone(true).data(data));
            if (data.context.find('button').hasClass('btn-danger')) {
                data.context.find('button.btn-danger').remove();
            }

            data.context.append(removeButton.clone(true).data(data));
        } else if (data.result.message) {
            $('#form_submit_button').prop('disabled', false);

            data.uploaded = false;
            data.context.append(removeButton.clone(true).data(data));

            var error = null;

            if (data.result.message.length > 0) {
                error = $('<div class="alert alert-danger" role="alert">').text(data.result.message);
                data.context.find('span')
                    .append('<br>')
                    .append(error);
            }
        }
    }).on('fileuploadfail', function (e, data) {
        $.each(data.files, function (index, file) {
            const error = $('<span class="text-danger"/>').text(file.error);
            $(data.context.children()[index])
                .append('<br>')
                .append(error);
        });
    }).prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled');

    // Load attachments when the message is edited
    if ($('#kmessageid').val() > 0) {
        $.ajax({
            type: 'POST',
            url: Joomla.getOptions('com_kunena.kunena_upload_files_preload'),
            async: true,
            dataType: 'json',
            data: {mes_id: $('#kmessageid').val()}
        })
            .done(function (data) {
                if ($.isEmptyObject(data.files) === false) {
                    fileCount = Object.keys(data.files).length;

                    filesedit = data.files;

                    $(data.files).each(function (index, file) {
                        let image = '';
                        if (file.image === true) {
                            image = '<img alt="" src="' + file.path + '" width="100" height="100" /><br />';
                        } else {
                            image = Joomla.getOptions('com_kunena.icons.attach') + ' <br />';
                        }

                        if (file.inline === true) {
                            fileeditinline = fileeditinline + 1;
                        }

                        const object = $('<div><p>' + image + '<span>' + file.name + '</span><br /></p></div>');
                        data.uploaded = true;
                        data.result = false;
                        data.file_id = file.id;

                        object.append(insertButton.clone(true).data(file));
                        object.append(removeButton.clone(true).data(data));

                        object.appendTo("#files");
                    });

                    if (fileeditinline == 0) {
                        $('#insert-all').show();
                    }

                    $('#remove-all').show();
                }
            })
            .fail(function () {
                //TODO: handle the error of ajax request
            });
    }
});
