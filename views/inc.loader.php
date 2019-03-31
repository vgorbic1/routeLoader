 <div class="log-container"> 
  <a href="index.php" title="cancel"><button class="btn-cancel"></button></a>
  <div class="log-loader">

    <div class="log-loader__drop-area">
      <span class="log-loader__drop-area--label">drag routes here</span>
    </div>
      
    <select name="template" class="log-loader__template" onchange="getTemplate()" disabled="true">
      <option value="">select template</option>
      <?php foreach ($templates as $template) { ?>
        <option value="<?php echo $template["name"]; ?>"><?php echo $template["name"]; ?></option>
      <?php } ?>
    </select>

  </div>

  <div class="routes-table"></div>

  <div class="log-loader">
    <button class="save-routes__btn" disabled >save routes</button>
  </div>
</div>

