<?php

#Catch invalid access
if (!defined('MEDIAWIKI')) {
    echo <<<EOT
This file is no valid access point to MediaWiki. Install this Extension by placing
require_once( "\$IP/extensions/SemanticMediaWikiGraph/SemanticMediaWikiGraph.php" );
in LocalSettings.php
EOT;
    exit(1);
}

#Register extension
$wgExtensionCredits[defined( 'SEMANTIC_EXTENSION_TYPE' ) ? 'semantic' : 'specialpage'][] = array(
    'path' => __FILE__,
    'name' => 'Semantic MediaWiki Graph',
    'author' => '[http://www.aifb.kit.edu/web/Tobias_Weller Tobias Weller]',
    'description' => 'Provides special pages for browsing Semantic MediaWiki links.',
    'version'  => '1.0',
    'license-name' => "Apache License 2.0",   // Short name of the license, links LICENSE or COPYING file if existing - string, added in 1.23.0
    'url' => "https://www.mediawiki.org/wiki/Extension:SemanticMediaWiki_Graph",
);

#Init special pages
$wgMessagesDirs['SemanticMediaWikiGraph'] = __DIR__ . '/i18n';
$wgExtensionMessagesFiles['SpecialSemanticMediaWikiGraphAlias'] = __DIR__ . '/includes/SpecialSemanticMediaWikiGraph.alias.php';
$wgAutoloadClasses['SpecialSemanticMediaWikiGraph'] = __DIR__ . '/includes/SpecialSemanticMediaWikiGraph.php';
$wgSpecialPages['SemanticMediaWikiGraph'] = 'SpecialSemanticMediaWikiGraph';

// Register hooks
// See also http://www.mediawiki.org/wiki/Manual:Hooks

$wgResourceModules['ext.SemanticMediaWikiGraph.init'] = array(
	'scripts' => array(
    'includes/js/app.js',
    'includes/js/d3_v4.min.js',
    'includes/js/utility.js',
	),
  'dependency' => array(
    'includes/js/select2.full.min.js',
  ),
  'styles' => array(
    'includes/css/select2.css',
    'includes/css/screen.css',
  ),
  'localBasePath' => dirname( __FILE__ ),
	'remoteExtPath' => 'SemanticMediaWikiGraph',
);
