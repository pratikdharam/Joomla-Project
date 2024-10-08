<?php
/**
 * @version		$Id: details_folder.php 17769 2010-06-20 01:50:48Z dextercowley $
 * @package		Joomla.Administrator
 * @subpackage	com_media
 * @copyright	Copyright (C) 2005 - 2010 Open Source Matters, Inc. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

// No direct access.
defined('_JEXEC') or die;

use Joomla\CMS\Language\Text;

?>
		<tr>
			<td class="imgTotal">
				<a href="index.php?option=com_jaextmanager&amp;view=repolist&amp;tmpl=component&amp;folder=<?php echo $this->_tmp_folder->path_relative; ?>" target="folderframe">
					<img src="components/com_jaextmanager/assets/images/icons/folder_sm.png" width="16" height="16" border="0" alt="<?php echo $this->_tmp_folder->name; ?>" /></a>
			</td>
			<td class="description">
				<a href="index.php?option=com_jaextmanager&amp;view=repolist&amp;tmpl=component&amp;folder=<?php echo $this->_tmp_folder->path_relative; ?>" target="folderframe"><?php echo $this->_tmp_folder->name; ?></a>
			</td>
			<td>&#160;

			</td>
			<td>&#160;

			</td>
			<td>
				<a class="delete-item" href="index.php?option=com_jaextmanager&amp;view=folder&amp;task=delete&amp;tmpl=component&amp;folder=<?php echo $this->state->folder; ?>&amp;<?php echo JSession::getFormToken(); ?>=1&amp;rm[]=<?php echo $this->_tmp_folder->name; ?>" rel="<?php echo $this->_tmp_folder->name; ?> :: <?php echo $this->_tmp_folder->files+$this->_tmp_folder->folders; ?>"><img src="components/com_jaextmanager/assets/images/icons/remove.png" width="16" height="16" border="0" alt="<?php echo Text::_('DELETE' ); ?>" /></a>
				<input type="checkbox" name="rm[]" value="<?php echo $this->_tmp_folder->name; ?>" />
			</td>
		</tr>
