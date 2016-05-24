<?php
    
    echo "
            <form method=\"post\" action=\"./actions/addCategoriesAdmin.php\" >
                <label>" . getString('name','Name') . ":</label>
                    <input name=\"name\" type=\"text\" class=\"form-control\" placeholder=\"" . getString('name','Name') . "\" />

                <label>" . getString('description','Description') . ":</label>
                    <textarea name=\"description\" type=\"textarea\" class=\"form-control\" placeholder=\"" . getString('description','Description') . "\" ></textarea>

                <label>" . getString('url','Url') . ":</label>
                    <input name=\"url\" type=\"text\" class=\"form-control\" placeholder=\"" . getString('url','Url') . "\"/>                                
                
                <br/><input name=\"submit\" type=\"submit\" value=\"" . getString('add','Add') . "\" class=\"btn btn-primary\"/>
            </form> 
        ";
   
?>