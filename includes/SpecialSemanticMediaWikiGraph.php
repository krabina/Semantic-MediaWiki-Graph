<?php
class SpecialSemanticMediaWikiGraph extends SpecialPage {
    function __construct() {
        parent::__construct( 'SemanticMediaWikiGraph' );
    }

    function getGroupName() {
        return 'smw_group';
    }

    function execute( $par ) {
        global $wgOut;
        global $wgScriptPath;
        $request = $this->getRequest();
        $this->setHeaders();
      //  $wgOut->addModules( 'ext.SemanticMediaWikiGraph.init' );
        $html = "
<!DOCTYPE html>
<html>

<head>
<script src='" . $wgScriptPath . "/extensions/SemanticMediaWikiGraph/includes/js/d3_v4.min.js'></script>
<script src='" . $wgScriptPath . "/extensions/SemanticMediaWikiGraph/includes/js/utility.js'></script>
<script src='" . $wgScriptPath . "/extensions/SemanticMediaWikiGraph/includes/js/app.js'></script>

<link href='" . $wgScriptPath . "/extensions/SemanticMediaWikiGraph/includes/css/select2.css' rel='stylesheet'/>
<link href='" . $wgScriptPath . "/extensions/SemanticMediaWikiGraph/includes/css/screen.css' rel='stylesheet'>


<script src='http://code.jquery.com/jquery.min.js'></script>
</head>
    <title>Title in the Browser</title>
<body>
<div class='wrapper' style='dispay:none'>

      <section>
        <article>
          <form id='example1' action='javascript:alert('Validation Successful')'>
    <div>
        <label>Wiki Article<span class='red'>*</span></label>
        <select id='wikiArticle' class='select2-input'><option value=''></option></select>

    </div>
</br>
    <div>
        <input type='submit' id='visualiseSite' name='submit' value='Submit'/><span id='error_msg' style='display:none' class='red'>\tWiki Article is missing</span>
    </div>

</form>
        </article>
      </section>

</div>
</br>
</br>
<div class='wrapper' id='cluster_chart'>
    <div class='chart' style='height:600px'></div>
</div>

</body>


</html>

";



        $wgOut->addHTML($html);
    }

}
