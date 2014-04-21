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
                width: 900px;
            }
            .methods_list li {
                margin-top: 20px;
            }
            .method_box {
                display: block;
                background: white;
                width: 900px;
                padding: 0px 20px 20px 20px;
                border-color: #bbbbbb;
                border-style: solid;
                border-width: 1px;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
				
            }
            .xml_box {
                display: block;
                background: #f8f8f8;
                width: 880px;
                padding: 0px 10px 0px 10px;
                border-color: #bbbbbb;
                border-style: solid;
                border-width: 1px;
            }
            .d {
                display: block;
                margin: -10px 0px -10px 0px;
            }
            .params_desc li {
                margin-top: -3px;
            }
        </style>
    </head>
    <body>
        <div class="main_box">
        <header><h1>GeTS API Description</h1></header>
        <h2>Contents</h2>
        <div class="menu">
            <ul>
                <li><a href="#login">Authorization with using Google account</a></li>
                <li><a href="#load-points">Load points</a></li>
                <li><a href="#get-categories">Get categories</a></li>
                <li><a href="#create-track">Create track</a></li>
                <li><a href="#load-tracks">Load tracks</a></li>
                <li><a href="#load-track">Load track</a></li>
                <li><a href="#delete-track">Delete track</a></li>
            </ul>
        </div>
        <h2>Methods list</h2>
        <ul class="methods_list">
            <li>
                <div id="login" class="method_box">
                    <p><b>Authorization with using Google account</b></p>
                    <p>Authorization with Google OAuth2 is performed in 2 steps.</p>
                    <p><b>First step</b>. Client sends empty requests. In response server will send an id and a redirect link. Client opens this redirect link in a web browser, so that user can enter their authorization data. An id will be used in the second step, so client must save it.</p>
                    <p><b>Request should be http://<?php echo $_SERVER['SERVER_NAME'];?>/projects/gets/service/userLogin.php</b></p>
                    <p><b>Request:</b></p>
                    <div class="xml_box">
                        <pre class="d"><code>
&lt;request&gt;
  &lt;params&gt;
    &lt;id&gt;&lt;/id&gt;
  &lt;/params&gt;
&lt;/request&gt;
                        </code></pre>
                    </div><br>
                      
                    <p><b>Response:</b></p>
                    <div class="xml_box">
                        <pre class="d"><code>
&lt;response&gt;
    &lt;status&gt;
        &lt;code&gt;...&lt;/code&gt;
        &lt;message&gt;...&lt;/message&gt;
    &lt;/status&gt;
    &lt;content&gt;
        &lt;auth_token&gt;...&lt;/auth_token&gt;
    &lt;/content&gt; 
&lt;/response&gt;
                        </code></pre>
                    </div><br>
                    <ul class="params_desc">
                        <li><i>auth_token</i> - token which will be used in further GeTS transactions</li>
                    </ul>
                </div>
            </li>
            <li>
                <div id="load-points" class="method_box">
                    <p><b>Load points</b></p>
                    <p>Loads points for circle defined by given: category, radius, latitude and longitude; or radius, latitude and longitude; or category.</p>
                    <p><b>Request should be http://oss.fruct.org/projects/gets/service/loadPoints.php</b></p>
                    <p><b>Request:</b></p>
                    <div class="xml_box">
                        <pre class="d"><code>
&lt;request&gt;
    &lt;params&gt;
        &lt;auth_token&gt;...&lt;/auth_token&gt;
        &lt;latitude&gt;...&lt;/latitude&gt;
        &lt;longitude&gt;...&lt;/longitude&gt;sss
        &lt;radius&gt;...&lt;/radius&gt;
        &lt;category_id&gt;...&lt;/category_id&gt;
    &lt;/params&gt;
&lt;/request&gt;
                        </code></pre>
                    </div><br>
                    <ul class="params_desc">
                        <li><i>auth_token</i> - auth token string (optional)</li>
                        <li><i>latitude</i> - float value</li>
                        <li><i>longitude</i> - float value</li>
                        <li><i>radius</i> - float non-negative value</li>
                        <li><i>category_id</i> - id of category - integer (list of category IDs can be obtained by getCategories request)</li>
                    </ul>    
                    
                    <p>Points can be retrieved by: only category_name, or latitude and longitude and radius, or combination of both previous possibilities.</p>
                    <p><b>Response:</b></p>
                    <div class="xml_box">
                        <pre class="d"><code>
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
                    <p>Method is returning list of point&#39;s categories available in GeTS service.</p>
                    <p><b>Request should be http://oss.fruct.org/projects/gets/service/getCategories.php</b></p>
                    <p><b>Request:</b></p>
                    <div class="xml_box">
                        <pre class="d"><code>
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
                        <pre class="d"><code>
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
                    <p>Tag categories contains list of categories placed in tags category. Each tag category contains tags:</p>
                    <ul class="params_desc">
                        <li><i>id</i> - identifier of category (positive integer)</li>
                        <li><i>name</i> - category&#39;s name (string) </li>
                        <li><i>description</i> - category&#39;s description (string)</li>
                        <li><i>url</i> - category's url (string)</li>
                    </ul>
                </div>
            </li>
<!-- Create track method -->
            <li>
                <div id="create-track" class="method_box">
                    <p><b>Create track</b></p>
                    <p>Method creates new track</p>
                    <p><b>Request should be http://oss.fruct.org/projects/gets/service/createTrack.php</b></p>
                    <p><b>Request:</b></p>
                    <div class="xml_box">
                        <pre class="d"><code>
&lt;request&gt;
    &lt;params&gt;
        &lt;auth_token&gt;...&lt;/auth_token&gt;
        &lt;name&gt;...&lt;/name&gt;
        &lt;description&gt;...&lt;/description&gt;
        &lt;url&gt;...&lt;/url&gt;
        &lt;lang&gt;...&lt;/lang&gt;
    &lt;/params&gt;
&lt;/request&gt;
                        </code></pre>
                    </div><br>
                    <ul class="params_desc">
                        <li><i>auth_token</i> - auth token string (string)</li>
                        <li><i>name</i> - name of new track (string)</li>
                        <li><i>description</i> - track&#39;s description (string)</li>
                        <li><i>url</i> - track&#39;s url (string)</li>
                        <li><i>lang</i> - track&#39;s language (language code string)</li>
                        <li><i>category_id</i> - id of track&#39;s category</li>
                    </ul>
                    <p><b>Response:</b></p>
                    <div class="xml_box">
                        <pre class="d"><code>
&lt;response&gt;
    &lt;status&gt;
        &lt;code&gt;0&lt;/code&gt;
        &lt;message&gt;success&lt;/message&gt;
    &lt;/status&gt;
    &lt;content/&gt;
&lt;/response&gt;
                        </code></pre>
                    </div>
                    <p>Error code</p>
                    <ul class="params_desc">
                        <li><i>0</i> - success </li>
                        <li><i>1</i> - other errors</li>
                        <li><i>2</i> - track already exists</li>
                    </ul>

                </div>
            </li>
<!-- Load tracks method -->
            <li>
                <div id="load-tracks" class="method_box">
                    <p><b>Load tracks</b></p>
                    <p>Method loads track list</p>
                    <p><b>Request should be http://oss.fruct.org/projects/gets/service/loadTracks.php</b></p>
                    <p><b>Request:</b></p>
                    <div class="xml_box">
                        <pre class="d"><code>
&lt;request&gt;
    &lt;params&gt;
        &lt;auth_token&gt;...&lt;/auth_token&gt;
        &lt;category_name&gt;...&lt;/category_name&gt;
    &lt;/params&gt;
&lt;/request&gt;
                        </code></pre>
                    </div><br>
                    <ul class="params_desc">
                        <li><i>auth_token</i> - auth token string (string, optional)</li>
                        <li><i>category_name</i> - filter tracks by category (string, optional)</li>
                    </ul>
                    <p><b>Response:</b></p>
                    <div class="xml_box">
                        <pre class="d"><code>
&lt;response&gt;
    &lt;status&gt;
        &lt;code&gt;0&lt;/code&gt;
        &lt;message&gt;success&lt;/message&gt;
    &lt;/status&gt;
    &lt;content&gt;
        &lt;tracks&gt;
            &lt;track&gt;
                &lt;name&gt;...&lt;/name&gt;
                &lt;description&gt;...&lt;/description&gt;
                &lt;category_id&gt;...&lt;/category_id&gt;
            &lt;/track&gt;
        &lt;/tracks&gt;
    &lt;/content&gt;
&lt;/response&gt;
                        </code></pre>
                    </div>
                    <p>Response contains tracks with given category name</p>
                    <ul class="params_desc">
                        <li><i>name</i> - track&#39;s name (string) </li>
                        <li><i>description</i> - track&#39;s description (string)</li>
                        <li><i>category_id</i> - id of track&#39;s category(string)</li>
                    </ul>
                </div>
            </li>
<!-- Load track method -->
            <li>
                <div id="load-track" class="method_box">
                    <p><b>Load track</b></p>
                    <p>Method loads content of track</p>
                    <p><b>Request should be http://oss.fruct.org/projects/gets/service/loadTrack.php</b></p>
                    <p><b>Request:</b></p>
                    <div class="xml_box">
                        <pre class="d"><code>
&lt;request&gt;
    &lt;params&gt;
        &lt;auth_token&gt;...&lt;/auth_token&gt;
        &lt;category_name&gt;...&lt;/category_name&gt;
    &lt;/params&gt;
&lt;/request&gt;
                        </code></pre>
                    </div><br>
                    <ul class="params_desc">
                        <li><i>auth_token</i> - auth token string (string, optional)</li>
                        <li><i>name</i> - name of track (string)</li>
                    </ul>
                    <p><b>Response:</b></p>
                    <div class="xml_box">
                        <pre class="d"><code>
&lt;response&gt;
    &lt;status&gt;
        &lt;code&gt;0&lt;/code&gt;
        &lt;message&gt;success&lt;/message&gt;
    &lt;/status&gt;
    &lt;content&gt;
        &lt;kml xmlns=&quot;http://www.opengis.net/kml/2.2&quot;&gt;
            &lt;Document&gt;
                &lt;name&gt;tr_private.kml&lt;/name&gt;
                &lt;open&gt;1&lt;/open&gt;
                &lt;Style id=&quot;styleDocument&quot;&gt;
                    &lt;LabelStyle&gt;
                        &lt;color&gt;ff0000cc&lt;/color&gt;
                    &lt;/LabelStyle&gt;
                &lt;/Style&gt;
                &lt;Placemark&gt;
                    &lt;name&gt;qwe&lt;/name&gt;
                    &lt;description&gt;&lt;![CDATA[QWE POI]]&gt;&lt;/description&gt;
                    &lt;ExtendedData&gt;
                        &lt;Data name=&quot;url&quot;&gt;
                            &lt;value&gt;http://example.com&lt;/value&gt;
                        &lt;/Data&gt;
                        &lt;Data name=&quot;audio&quot;&gt;
                            &lt;value&gt;http://example.com/1.mp3&lt;/value&gt;
                        &lt;/Data&gt;
                        &lt;Data name=&quot;description&quot;&gt;
                            &lt;value&gt;QWE POI&lt;/value&gt;
                        &lt;/Data&gt;
                    &lt;/ExtendedData&gt;
                    &lt;Point&gt;
                        &lt;coordinates&gt;61,34,0.0&lt;/coordinates&gt;
                    &lt;/Point&gt;
                &lt;/Placemark&gt;
            &lt;/Document&gt;
        &lt;/kml&gt;
    &lt;/content&gt;
&lt;/response&gt;
                        </code></pre>
                    </div>
                    <p>Response contains tracks points in KML format with optional data in ExtendedData tag</p>
                </div>
            </li>
<!-- Delete track method -->
            <li>
                <div id="delete-track" class="method_box">
                    <p><b>Delete track</b></p>
                    <p>Method deletes existing track</p>
                    <p><b>Request should be http://oss.fruct.org/projects/gets/service/deleteTrack.php</b></p>
                    <p><b>Request:</b></p>
                    <div class="xml_box">
                        <pre class="d"><code>
&lt;request&gt;
    &lt;params&gt;
        &lt;auth_token&gt;...&lt;/auth_token&gt;
        &lt;name&gt;...&lt;/name&gt;
    &lt;/params&gt;
&lt;/request&gt;
                        </code></pre>
                    </div><br>
                    <ul class="params_desc">
                        <li><i>auth_token</i> - auth token string (string)</li>
                        <li><i>name</i> - name of track (string)</li>
                    </ul>
                    <p><b>Response:</b></p>
                    <div class="xml_box">
                        <pre class="d"><code>
&lt;response&gt;
    &lt;status&gt;
        &lt;code&gt;0&lt;/code&gt;
        &lt;message&gt;Channel successfully removed&lt;/message&gt;
    &lt;/status&gt;
    &lt;content&gt;Removed 1 channel(s)&lt;/content&gt;
&lt;/response&gt;
                        </code></pre>
                    </div>
                </div>
            </li>
        </ul>
        <footer><br>
            Posted by: Nikita Davydovsky<br>
            Contact information: <a href="mailto:davydovs@cs.karelia.ru">
            davydovs@cs.karelia.ru</a>.<br>
        </footer>
        </div> 
    </body>
</html>
