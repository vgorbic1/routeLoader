<div class="template-container"> 
  <a href="index.php" title="cancel"><button class="btn-cancel"></button></a>
  <div class="template-loader">

    <div class="template-loader__drop-area">
      <span class="template-loader__drop-area--label">drag a route here</span>
    </div>
      
    <select name="database" class="template-loader__database" onchange="getData()" disabled="true">
      <option value="">select database</option>
      <?php foreach ($databases as $database) { ?>
        <option value="<?php echo $database["DB_NAME"]; ?>"><?php echo $database["DB_TITLE"]; ?></option>
      <?php } ?>
    </select>

  </div>
  <div class="template-loader">

    <div class="template-table" data-signed="<?php echo $signed ?? "" ?>"></div>
    <button class="save-template__btn" disabled >save template</button>

  </div>
</div>