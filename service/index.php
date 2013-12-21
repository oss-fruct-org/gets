<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
	<title>GeTS API Description</title>
        <style>
            html {
                color: #555555;
            }
            body{
                background: LightGrey; /* Цвет фона веб-страницы */
            }
            .main_box {
                display: block;
                position: relative;
                left: 50%;
                margin-left: -450px;
                width: 900px;
                //height: 150px; 
            }
            .menu {
                background: white;
                width: 250px;
            }
            .menu ul {
                list-style-type: none;
                padding: 20px;
                margin: 0px;
                border-color: #bbbbbb;
                border-style: solid;
                border-width: 1px;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
            }
            .menu ul li {
                margin-top: 5px;
            }
            .menu ul li a {
                color: #555555;
                text-decoration: none;
            }
            .menu ul li a:hover {
                text-decoration: underline;
            }
            .methods_list {
                list-style-type:none;
                padding:0px;
                margin:0px;
            }
            .methods_list li {
                margin-top: 20px;
            }
            .method_box {
                display: block;
                background: white;
                width: 900px;
                padding: 20px;
                border-color: #bbbbbb;
                border-style: solid;
                border-width: 1px;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
				
            }
            .xml_box {
                display: block;
                background: #f8f8f8;
                width: 600px;
                padding: 20px;
                border-color: #bbbbbb;
                border-style: solid;
                border-width: 1px;
                //padding-top: -10px;
                //padding-bottom: -10px;
            }
            .params_desc li {
                margin-top: -3px;
            }
        </style>
    </head>
    <body>
        <div class="main_box">
        <h1>GeTS API Description</h1>
        <h2>Contents</h2>
        <div class="menu">
            <ul>
                <li><a href="#load-points">Load points</a></li>
                <li><a href="#get-categories">Get categories</a></li>
            </ul>
        </div>
        <h2>Methods list</h2>
        <ul class="methods_list">
            <li>
                <div id="load-points" class="method_box">
                    <p><b>Load points</b></p>
                    <p>Loads points for circle defined by given: category, radius, latitude and longitude; or radius, latitude and longitude; or category.</p>
                    <p><b>Request should be http://oss.fruct.org/projects/gets/service/loadPoints.php</b></p>
                    <p><b>Request:</b></p>
                    <div class="xml_box">
                        <pre><code>
&lt;request>&gt;
    &lt;params&gt;
        &lt;auth_token&gt;...&lt;/auth_token&gt;
        &lt;latitude&gt;...&lt;/latitude&gt;
        &lt;longitude&gt;...&lt;/longitude&gt;
        &lt;radius&gt;...&lt;/radius&gt;
        &lt;category_name&gt;...&lt;/category_name&gt;
    &lt;/params&gt;
&lt;/request&gt;
                        </code></pre>
                    </div><br>
                    <ul class="params_desc">
                        <li><i>auth_token</i> - auth token string (optional)</li>
                        <li><i>latitude</i> - float value</li>
                        <li><i>longitude</i> - float value</li>
                        <li><i>radius</i> - float non-negative value</li>
                        <li><i>category_name</i> - name of category string</li>
                    </ul>    
                    
                    <p>Points can be retrieved by: only category_name, or latitude and longitude and radius, or combination of both previous possibilities.</p>
                    <p><b>Response:</b></p>
                    <div class="xml_box">
                        <pre><code>
&lt;response&gt;
    &lt;status&gt;
        &lt;code&gt;...&lt;/code&gt;
        &lt;message&gt;...&lt;/message&gt;
    &lt;/status&gt;
    &lt;content&gt;
        %list of points in kml format%
    &lt;/content&gt; 
&lt;/response&gt;
                        </code></pre>
                    </div>
                </div>
            </li>
			<li>
                <div id="get-categories" class="method_box">
                    <p><b>Get Categories</b></p>
                    <p>Method is returning list of point's categories available in GeTS service.</p>
                    <p><b>Request should be http://oss.fruct.org/projects/gets/service/getCategories.php</b></p>
                    <p><b>Request:</b></p>
                    <div class="xml_box">
                        <pre><code>
&lt;request&gt;
    &lt;params&gt;
        &lt;auth_token&gt;...&lt;/auth_token&gt; 
    &lt;/params&gt;
&lt;/request&gt;
                        </code></pre>
                    </div><br>
                    <ul class="params_desc">
                        <li><i>auth_token</i> - auth token string (optional)</li>
                    </ul>
                    <p><b>Response:</b></p>
                    <div class="xml_box">
                        <pre><code>
&lt;response&gt;
    &lt;status&gt;
        &lt;code&gt;...&lt;/code&gt;
        &lt;message&gt;...&lt;/message&gt;
    &lt;/status&gt;
    &lt;content&gt;
        &lt;categories&gt;
            &lt;category&gt;
                &lt;id&gt;...&lt;/id&gt;
                &lt;name&gt;...&lt;/name&gt;
                &lt;description&gt;...&lt;/description&gt;
                &lt;url&gt;...&lt;/url&gt;
            &lt;/category&gt;
        &lt;/categories&gt;
    &lt;/content&gt; 
&lt;/response&gt;
                        </code></pre>
                    </div>
                    <p>Tag categories contains list of categories placed in tags category.Each tag category contains tags:</p>
                    <ul class="params_desc">
                        <li><i>id</i> - identifier of category (positive integer)</li>
                        <li><i>name</i> - category's name (string) </li>
                        <li><i>description</i> - category's description (string)</li>
                        <li><i>url</i> - category's url (string)</li>
                    </ul>
                </div>
            </li>
        </ul>
        </div>
    </body>
</html>
