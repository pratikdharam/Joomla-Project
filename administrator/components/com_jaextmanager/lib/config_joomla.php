<?php
/**
 * ------------------------------------------------------------------------
 * JA Extension Manager Component
 * ------------------------------------------------------------------------
 * Copyright (C) 2004-2018 J.O.O.M Solutions Co., Ltd. All Rights Reserved.
 * @license - GNU/GPL, http://www.gnu.org/licenses/gpl.html
 * Author: J.O.O.M Solutions Co., Ltd
 * Websites: http://www.joomlart.com - http://www.joomlancers.com
 * ------------------------------------------------------------------------
 */
// no direct access
defined ( '_JEXEC' ) or die ( 'Restricted access' );

use Joomla\CMS\Language\Text;
use Joomla\Filesystem\File;
use Joomla\Filesystem\Folder;
use Joomla\CMS\Component\ComponentHelper;

jimport('joomla.filesystem.file');
jimport('joomla.filesystem.folder');
// This file will hold configuration for UpdaterClient
global $config;

$jConfig = new JConfig();
$params = ComponentHelper::getParams(JACOMPONENT);
$defaultService = jaGetDefaultService();

$data_folder = jaucGetDataFolder($params->get("DATA_FOLDER", "jaextmanager_data"));

define('JA_WORKING_DATA_FOLDER', $data_folder);


function jaucRaiseMessage($message, $error = false)
{
	if (!empty($message)) {
		if ($error) {
			echo "<div style=\"color:red; font-weight:bold;\">$message</div>";
		} else {
			echo "<div style=\"color:green; font-weight:bold;\">$message</div>";
		}
	}
}


function jaucGetDataFolder($path)
{
	$FileSystemHelper = new FileSystemHelper();
	$path = $FileSystemHelper->clean($path.'/');
	$rootPath = $FileSystemHelper->clean($_SERVER['DOCUMENT_ROOT']);
	return (strpos($path, $rootPath) === 0) ? $path : JPATH_ROOT.'/'.$path;
}


//validate settings
function jaucValidServiceSettings($params)
{
	$errMsg = "";
	if (!is_dir(JA_WORKING_DATA_FOLDER)) {
		if (!Folder::create(JA_WORKING_DATA_FOLDER, 0755)) {
			$errMsg .= Text::_("JA_UPDATER_CAN_NOT_CREATE_BELOW_FOLDER_AUTOMATICALLY_PLEASE_MANUAL_DO_IT") . "<br />";
			$errMsg .= "<i>" . JA_WORKING_DATA_FOLDER . "</i>";
		}
	} elseif (!is_writeable(JA_WORKING_DATA_FOLDER)) {
		if (!chmod(JA_WORKING_DATA_FOLDER, 0755)) {
			$errMsg .= Text::_("JA_UPDATER_CAN_NOT_AUTOMATICALLY_CHMOD_FOR_BELOW_FOLDER_TO_WRIABLE_PLEASE_MANUAL_DO_IT") . "<br />";
			$errMsg .= "<i>" . JA_WORKING_DATA_FOLDER . "</i>";
		}
	} else {
		$fileAccess = JA_WORKING_DATA_FOLDER . ".htaccess";
		if (!is_file($fileAccess)) {
			$buffer = "Order deny,allow\r\nDeny from all";
			File::write($fileAccess, $buffer);
		}
	}
	if (substr(PHP_OS, 0, 3) == 'WIN') {
		if (!is_dir(dirname($params->get("MYSQL_PATH") ?: ''))) {
			$errMsg .= Text::_("PATH_TO_MYSQL_CLI_IS_NOT_CORRECT") . "<br />";
		}
		if (!is_dir(dirname($params->get("MYSQLDUMP_PATH") ?: ''))) {
			$errMsg .= Text::_("PATH_TO_MYSQL_DUMP_CLI_IS_NOT_CORRECT") . "<br />";
		}
	}
	if ($errMsg != "") {
		if (JRequest::getVar('layout') == 'config_service') {
			jaucRaiseMessage($errMsg, true);
		}
	}
}
//option=com_jauc&view=default&layout=config_service
if (!(JRequest::getVar('option') == JACOMPONENT && JRequest::getVar('view') == 'default' && JRequest::getVar('layout') == 'config_service')) {
	jaucValidServiceSettings($params);
}
// Component config

$config = new UpdaterConfig(
		array(
			// Define the web service URI
			"WS_MODE"	=> $defaultService->ws_mode,
			"WS_URI"	=> $defaultService->ws_uri,
			"WS_USER"	=> $defaultService->ws_user,
			"WS_PASS"	=> $defaultService->ws_pass,
			//root path to installed product (is root path of website)
			//it is different from the concept of repo path on server
			"REPO_PATH" => JPATH_ROOT . '/',
			// MySQL info
			"MYSQL_HOST" 	=> $jConfig->host,
			"MYSQL_USER" 	=> $jConfig->user,
			"MYSQL_PASS" 	=> $jConfig->password,
			"MYSQL_DB" 		=> $jConfig->db,
			"MYSQL_DB_PREFIX" 	=> $jConfig->dbprefix,
			// Using for backup database
			"MYSQL_PATH" 		=> $params->get("MYSQL_PATH"),
			"MYSQLDUMP_PATH" 	=> $params->get("MYSQLDUMP_PATH")
		)
	);

ini_set('xdebug.max_nesting_level', 100);
ini_set('xdebug.var_display_max_depth', 100);
