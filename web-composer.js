/*
//PARA HACER
3. guardar en el servidor cada vez que cambie algo (inmediatamente)
6. utilizar el símbolo + para insertar componentes. Revisar iconos y menús
8. Incorporar traducciones
10.añadir atributo. Poner select con los tipos disponibles
20.vocabulario. Dar una definición única a container,column,segment,section,component,....
24.mover con las teclas la selección de segmentos, ir al padre, o al anterior o siguiente
2. Encapsular la sintaxis de clases de componentes para dependencias (iife??). Compatible modulos nodejs
94.Revisar general-scripts.js y dividir y organizar las funciones en varios ficheros según un criterio consistente
162.media queries o equivalente para definir versiones de la página para distintos tamaños de pantalla
166.Introducir marcas de accesibilidad
167.Crear temas. ¿Que es un tema?. ¿son CSS globales y plantillas de segmentos?
169.Incorporar todos los Componentes JS disponibles de Marko ¿queda alguno?
175.Segmento en modo sidebar, y rail (semanticui)
171.Revisar los cambios sin deshacer
201.Revisar guardado automático de la página
190.Poder colocar segmentos de un for en linea
214.Si se selecciona un segmento que referencia a otro, poderlo abrir en lectura
215.Resolver acceder a elementos con href aunque no sean componentes (se da en algunos menus)
218.Eliminar modos de edición en render, pero sin afectar pintado de segmentos _ref
220.Incluir un botón en modo de previsualización para ir a la página en el node
221.Utilizar un sistema de modelado de plantillas/formularios para unificar y simplicar todos los modales
230.Revisar menu de selección de componentes (menu semantic) cuando no cabe en la hoja. Problemas con portátiles
231.Operación para deshacer sin haber guardado
235.rendercomponent se llama desde cada componente, y es posible que se llame dos veces. Ha de llamarse implícitamente. Revisar
236.Al editar una consulta SQL desde el builder, dar acceso a una consola SQL para revisar la consulta
237.urlencode las consultas SQL
242.los data-xxx desconocidos que no los borre???
243.Si se añade json en un formulario de edición, se pierde al guardar.!!!!!
245.Quitar colores de la barra de edición??
266.Permitir incluir mas de un formulario por página. Ahora tienen todos el mismo nombre, id, ... probar si se puede
259.Permitir incluir mas de un mapa por página. Todos mismo nombre, id ....
260.Autorizar a otros usuarios de una forma fácil
262.Parametrización de segmentos cargados con _ref (merge de jsons????,contextos??, evaluate??)
272.Recuperar el modo previsualización en render en algunos componentes (por ejemplo el dv-simple), por ejemplo onhover para ver traducciones, ...
273.Merge de componentes dv-simple (para unir párrafos de un texto)
274.Editor para editar textos en varios idiomas
277.Operacion para añadir un segmento en una página que engloble todos los segmentos de la paǵina.
282.Al hacer intro en un parrafo pone </div><div>. Intentar poner <BR>. O como agrupar muchos párrafos en un solo componente.
285.isFilterable no funciona en dv-tables. Resolver en aquel módulo o desactivar en el formulario de configuración del descriptor
287.Generar el menú de componentes en arbol, y que se cree automáticamente con los componentes cargados
288.Unir las librerias, js, css, con el componente. No en un directorio dist
290.No funciona centrado de texto, parece que aplica al hijo y no al padre
291.Filtro de html del texto en dv-simple
292.Construir los formularios del propio programa con dv-form????
293.Configurar crop de imagen
300.Utilizadades de procesamiento masivo de páginas
302.Si ha cambiado algo en un modal con editor, advertir antes de dejar cerrar.
303.Idear algún sistema para que las clases de la web no suplanten las del editor (semantic) y lo dejen inoperativo
304.Idear algún sistema para gestionar el acceso concurrente a los datos de la web (y también de las páginas)
306.Intentar cambiar ui container por otro elemento de semantic que permita 'simular' el dispositivo. Solo conservar container para 1er nivel de segmentos
310.Boton en visualizar dentro de navegador, para recargar
312.Cursor cargando mientras estén los datos cargando, o un nuevo componente que haga esta función
313.Cambiar nombre de los componentes de dv->zb (Zity Builder) para evitar confusiones
314.Guardar en codemirror con CTL+S
315.Revisar reglas de descriptor en tablas. Solo un campo puede ser colapsible???.
316.Añadir refolding a tabla (nivel de repliegue)
317.En algunas ocasiones pierde los owners
318.Al editar datos de la página guardar inmediatamente
319.No borrar páginas. Marcarlas de alguna manera como elmininadas, y que no aparezcan en listados
321.Si la página no se ha modificado desde la última grabación, no mostrar mensaje de aviso al cerrar
322.La grafica de líneas no tiene ancho por defecto, y no se pinta
326.editor de consultas en datasource, como el de descriptores en tablas.
328.Revisar todo el código para cambiar src por file en las imagenes
329.Cambiar render de dv-simple img para que utilice el campo file
331.Leer las dependencias de componentes desde index.json también en el modo de edición
337.Desactivar boton de enlace en menu-segmento, menu-componente, si el elemento no tiene href
338.Title, y alt han de ser traducibles
339.Revisar componentes dentro de componentes. Se ha probado pero está por completar.
340.Al guardar crear un número de versión del documento. Si es mayor el del destino que el local, no guardar
341.


//HECHO 8/2
335.Traducción de dv-parallax y de dv-carrousel
336.Botón en menú edición segmento para acceder al href (si lo tiene)

//HECHO 25/1
334.Render de links por nombre

//HECHO 16/1
332.Componentes complejos. Formados por varios componentes anidados. Falta toHTML

//HECHO 16/11
327.Guardar file de Files (imagenes) añadidas en dv-simple
330.Modificado doAjax para añadir content-type, y pasar a json data

//HECHO 6/10
323.dv-gallery puede leer las imágenes del servidor CDN con el atributo source
324.Dar un alto a la galeria para que se vea bien en el render
325.Fijar un alto de las fotos de la galeria para ajustar tamaños en render y tohtml


*/
let hasChanged = false;
let themeMode = localStorage.theme || "dark";
setTheme(themeMode)

function detectChanges(){
    hasChanged = true;
}

function changeThemeMode(){
    setTheme(themeMode === "dark" ? "light": "dark");
}

function setTheme(mode){
    themeMode = mode;
    localStorage.theme = themeMode;
    document.getElementsByTagName( 'html' )[0].className = "theme-" + mode
}

function activeSavePageButton(){
    if(!hasChanged) {
        hasChanged = true;
    }
}

function disableSavePageButton(){
    if(hasChanged) {
        hasChanged = false;
    }
}

/// !!!!!! DESHACER
/// undo
///
/// Posiblemente sea preferible desarrollar la operación deshacer sobre el modelo de paǵina en json
/// Puede hacerse operación a operación sobre el json del elemento
/// O sobre el json de la página
///

function replaceNodo(json) {
    if (selectedItem && selectedItem !== "") {

        var path = selectedItem.dataset.path || "";
        var type = "",
        nodo = selectedItem;

        if (selectedItem.getAttribute("data-editor") === "segment") { //es un segmento
//			console.log("segment");

            if (json.type) type = json.type
            else if (hasClass(selectedItem, "column")) type = "column";

            nodo = segment_render(type, json, path);

        } else if (selectedItem.getAttribute("data-editor") === "component") { //es un componente
            type = selectedItem.dataset.component;
            nodo = component_render(type, json);
        } else
            alert("Tipo de elemento desconocido");

        try {
            selectedItem.replaceWith(nodo);
            selectedItem = nodo;
            showEditionMenu();
        } catch (e) {
            console.log("ERROR",e);
            return false;
        }
    } else {
        // Cambiar toda la página
        //!! esto me parece peligroso????
        //console.log("cambiando toda la página");
        pageData.segments = json;
        renderPage(pageData);
    }
}


/**Guarda una nueva página */
// function saveNewPage() {
//     var name = $("#templateName").val();
//     var title = $("#templateTitle").val();
//     var web = $("#templateWeb").val();
//     if (name.length < 3) {
//         $("#saveDataError").show();
//     } else {
//         pageData['name'] = name;
//         pageData['title'] = title;
//         pageData['web'] = web;

//         savePage(API + getRealm() + "/collections/paginas", "POST");

//         $('#saveDataModal').modal('hide');
//     }
// }

async function getRevisions(id) {
    doAjax(API + getRealm() + "/collections/paginas/" + id + "/revisions")
        .then(function(res) {
            //console.log(res);
            if (res) {} else {
                console.log("ERROR ", id, res);
            }
        });
}

function openDeletePageModal(id) {
    document.querySelector("#deletePageButton").setAttribute("data-id", id);
    $('#deletePageModal').modal('show');
}

function logged(user) {
    USERDATA = user;
    REALM = getRealm(user.realm);
    //console.log(REALM)
    document.dispatchEvent(new Event('ready'));

    $('#elementInfoMessageContainer').append(`
        <div class="userInfoPopup">
            <h4>${user.username}</h4>
            <div>${user.firstName?user.firstName:''} ${user.lastName?user.lastName:''}</div>
            <div>Realm: ${user.realm}</div>
        </div>
        `);

    // $("#elementInfoMessage").append(`
    //     <div class="three wide right bottom aligned column" style="padding: .5rem;">
    //         <button id="logoutSession" class="circular ui icon red button logoff" title="Pulsa para desconectar" onclick="logout()">
    //             <i class="icon sign out alternate"></i>
    //         </button>
    //         <a href="https://zitybuilder.digitalvalue.es" target="_blank" class="ui circular icon button" title="Para abrir nueva solapa">
    //             <i class="icon plus"></i>
    //         </a>
    //     </div>
    //     `);

    $("#logoutSession").hover(function() {
        $(".userInfoPopup:hidden").show()
    }, function() {
        $(".userInfoPopup:visible").hide()
    });
    // m.redraw()
    //cargarListadoDePaginas();
    //openImportSegment();
}

function logout() {
    //var confirma = confirm("¿Deseas cerrar sesión?");
    //if (confirma) {
        window.location.replace("./")
        console.log(window.location)
        document.cookie = "memory.sid" + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        
        doAjax(APIUSER + "logout")
            .then(function(response) {
                //console.log("logout", response);
                location.reload();
            })
            .catch(function(error) {
                console.error(error);
            });
  //  }
}

/**Carga la página seleccionada */

/**Colna un objecto JSON. Para evitar que las asignaciones se pasen por referencia */
function cloneObject(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    return JSON.parse(JSON.stringify(obj));
}

/// !!! juntar estas dos funciones. factor comun

async function loadDependencies() {
console.log("[loadDependencies]")
    var webconf = pageData.web && pageData.web != "" ? await getWebData(getRealm(),pageData.web) : {};
    // console.log( "pageData: ", pageData)
    // console.log( "loadDependencies: ", webconf)

    webconf.dependencies && webconf.dependencies.js && webconf.dependencies.js.map(js=>loadScript(js))
    webconf.dependencies && webconf.dependencies.css && webconf.dependencies.css.map(css=>loadCss(css))
}

// !!!! revisar saveEditedPage y juntar !!!!


async function renderPage(page) {

    let movementX=0
    //console.log('renderPage', JSON.parse(JSON.stringify(page)))
    //console.log('Page: ', page)
    var main = mainPage.querySelector('#main');
    var _style = "";
    var favicon = "";
    var webData = page.web && page.web != "" ? await getWebData(getRealm(),page.web) : {};
    // borra lo anterior
    main.innerHTML = "";
    // Leemos los datasources

    if (page.datasources && page.datasources !== "[]") {  // Simplicar para que no carga innecesariamente muchas veces los datos
        //!!! aplicar parámetros. Como evaluamos los campos???
        let sources = [];
        let json = JSON.parse(page.datasources);
        let context={}
        sources = json.map(function (datasource) {

            //console.log("datasources",datasource, evaluate(datasource.url, context, datasource.slots))
            let options = datasource.options || undefined;
            
            return fetchJSON(evaluate(datasource.url, context, datasource.slots), options)
                .then(function (data) {
                    // Si no se evalua y existe default aplicar
                    console.log("DATASource", data)
                    pageData.context[datasource.name] = !data && datasource.default ? datasource.default : data
                    if (data && datasource.edition && data.items && data.items[0]) {
                        if (!context.edition) context.edition=[]
                        const savedInContext = context.edition.some( el => el.id === data.items[0]._id);
                        if(!savedInContext)
                        context.edition.push({collection:datasource.edition,id:data.items[0]._id})
                    }
                })
        })

        await Promise.all(sources)
       // pageData.context=context
    }
    //Primera carga de pagina limpia array de segmentos!!!!!
   // console.log('renderPage 2', JSON.parse(JSON.stringify(page)))

    // Reinicia los errores
    page.errors=[]

    if (page.title)
        document.title = `${page.templates ? "PL" : "ED"} | ${page.title}`;
    if (page._id) main.setAttribute("data-id", page._id);

    if (webData && webData.style)
        _style += webData.style + "\n";
    if (page.style)
        _style += page.style;

    if (_style.length > 0) {
        var expresion = new RegExp(/[^:root|#main](.+{)/g);
        var newstyle = _style.replace(expresion, `#main $1`);
        newstyle = newstyle.replace(`#main @`, `@`);
        var style = document.createElement("style");
        style.innerHTML = newstyle;
        main.appendChild(style);
    }

    if (page.segments) {
        page.segments.map(function(item, i) {
            var path = "segments." + i;
            var container = segment_render('', item, path);
            main.appendChild(container);
        });
    }
   // console.log("Main: ", page)
	// Dependencias js de la web

    //SE REPITE en LINEA 292
    //var webconf = page.web && page.web != "" ? await getWebData(page.web) : {};
    if (webData && webData.dependencies && webData.dependencies.js) {
        webData.dependencies.js.forEach(depend => {
            if(depend.indexOf('mithril') == -1){
                let script = document.createElement("script");
                script.id = "web-script-dependencies";
                script.src = depend;
                main.appendChild(script);
            }
		});
    }

    if (webData.dependencies && webData.dependencies.css) {
        webData.dependencies.css.forEach(depend => {
            let link = document.createElement("link");
            link.id = "web-css-dependencies";
            link.href = depend;
            link.setAttribute("rel", "stylesheet")
            link.setAttribute("type", "text/css")
            main.appendChild(link);

		});
    }

	// scripts de la pagina
    // if (page["user-scripts"]) {

    //     var script = document.createElement("script");
    //     script.id = "page-scripts";
    //     script.innerHTML = page["user-scripts"];
    //     console.log("pageScript: ", script)
    //     main.appendChild(script);
    // }

	// Codigo js general de la web
    // if (webData.script) {
    //     var script = document.createElement("script");
    //     script.id = "web-scripts";
    //     script.innerHTML = webData.script;
    //     console.log("webScript: ", script)
    //     main.appendChild(script);
    // }

    main.style.position='relative';
    var edition = mainPage.querySelector('#edition');

    main.parentNode.addEventListener("mousedown",(e)=>{

        if(e.which === 1){
            // Solo cuando se pincha fuera
            if (main.contains(e.target)) return
            if (edition.contains(e.target)) return  // Tampoco se afectan los controles de edición

            // nodo.style.background='lime';
            main.style.background ='#e5f9b5';

            //console.log("mousedown",e.target)
            e.preventDefault()
            e.stopPropagation()
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stop);
        }
    })

    function drag(e) {
        movementX += e.movementX
        if (e.ctrlKey) {
            let width= Math.floor((1920+movementX)/1920*100)
            main.style.maxWidth=`${width}%`
        }
        else
            main.style.left=`${movementX}px`
    }

    function stop(e) {
        //console.log("mouseup")
        main.style.background='white'
        document.removeEventListener('mousemove', drag)
        document.removeEventListener('mouseup', stop)
    }

    //    document.querySelector("#pageInfo").innerHTML = "<p>Página: " + (pageData._id || "Aún no guardada") + " " + pageData.name + "<br>Web: " + pageDa//ta.web + "</p>";
    // document.querySelector("#pageInfo").innerHTML = "<b class='ui huge header'>" + pageData.name + "</b>Web: " + pageData.web + "<br>Sección: " + pageData.section + "</p>";

    // if(pageData.web){
    //     document.querySelector("#pageInfo").style.display = 'block';
    //     let section = "";
    //     if(pageData.web)
    //         document.getElementById('web').innerHTML = 'https://' + pageData.web.toLowerCase() + '.es';

    //     if(pageData.section)
    //         section = '/' + pageData.section;

    //     if(pageData.name)
    //         document.getElementById('pageName').value = section + '/' + pageData.name;
    // }

    //unselectItem();

    // !!! intentar colocar en algún otro sitio que se repinte menos
    removePageLoader()
    m.redraw();
}

function catchLinks(root, cb) {
    root.addEventListener('click', function(ev) {

        //console.log("CLICK catchLinks")

        //ev.ctrlKey ||
        if (ev.altKey || ev.metaKey || ev.shiftKey || ev.defaultPrevented) {
            return true;
        }

        var anchor = null;
        for (var n = ev.target; n.parentNode; n = n.parentNode) {
            if (n.nodeName === 'A') {
                anchor = n;
                break;
            }
        }
        if (!anchor) {
            //console.log("NO ANCHOR", root);
            return true;

        }

        var href = anchor.getAttribute('href');

        //        if (u.host) return true;

        ev.preventDefault();
        cb(href);

        return false;
    });
}


function componentModal() {
    let modal = "";
    for (var name in registeredComponents) {
        if (registeredComponents[name].modal)
            modal += registeredComponents[name].modal();
    }
    return modal;
}

//!!!gestionar mejor el error si no existe???
function getComponent(name) {
    //console.log("components: ", registeredComponents)
    if (registeredComponents[name]) return registeredComponents[name];
    else return {};
}

async function loadScript(ajaxurl, callback) {
    //if(ajaxurl.indexOf('mithril') > -1) return
    let resp
    try {
        resp = await $.ajax({
            url: ajaxurl,
            method: "GET",
            dataType: "script"
        });

        if (callback) callback();
    } catch (error) {
        viewMainMessage(
            "error",
            "<p>No se pudo conectar con <b>" + ajaxurl + "</b></p>"
        );
        resp = new Promise((resolve => resolve()))
    }
    return resp
}

function attrib2Json(attr, component, key) {
    var value = component.getAttribute(key);
    if (value) attr[key] = value;
}

/*
function abrirPagina() {
    if (!pageData._id) {
        viewMainMessage("error", "<p>Esta página no tiene ID. Guárdala primero</p>");
        return;
    }
    try {
        window.open(`http://localhost:8800/${getRealm()}/page/${pageData._id}`, '');
    } catch (e) {
        console.log(e)
    }
}
*/

//Datos generales de la web

async function webConfigurationModal(type, mode = 'css') {
    const data = await getWebData(getRealm(),pageData.web);
    let title,
        webName,
        value;
    if(pageData.web)
        webName = pageData.web.toLowerCase().replace(/\s/g, "-");
    else
        webName = 'sin-web';


    if(type === 'dependencies'){
        title = "dependencias-web.json";
        const dependencies = data[type] || { css: [], js: [] }
        value = JSON.stringify(dependencies, null, 2)
    }else if(type === "style"){
        title = "global-style.css";
        value = data[type]
    }else {
        title = "main-script.js";
        value = data[type]
    }

    ZityModal({
        value: value,
        mode, 
        title: webName + ": " + title,
        // lastModified: data["changes-" + type] ? data["changes-" + type] : null, 
        onsave: (value) => {
            if(type === 'dependencies'){
                try {
                    JSON.parse(value)
                }catch(e){
                    alert(e)
                    return false
                }
            }
            saveWebConfiguration(value);
            return true;
        } 
    })

    //Guarda los datos de la web en el API
    async function saveWebConfiguration(value) {
        const webData = await getWebData(getRealm(),pageData.web)
            
        if(type === "dependencies"){
            if (!webData.web || webData.web == ''){
                webData.web = pageData.web;
            }
            webData[type] = isJson(value) ? JSON.parse(value) : {};
        }else{
            webData[type] = value;
        }
        //webData['changes-' + type] = new Date().toLocaleString('es-ES');
        if (!webData.owners || webData.owners.lenght < 1) {
            webData.owners = new Array;
            webData.owners.push(USERDATA._id);
        }
        

        let response
        try {
            if (webData._id) {
                response = await doAjax(API + getRealm() + "/collections/webs/" + webData._id, "PUT", "json", webData);
            }else if(!webData.web || webData.web === ""){
                if (!webData.web || webData.web === "")
                    webData.web = pageData.web;
                response = await doAjax(API + getRealm() + "/collections/webs", "POST", "json", webData);
            }
        } catch (e) {
            console.error(e);
        }

        if(response){
            ZityMessage({
                success: true,
                name: title,
                body: "guardado"
            });
        }else{
            ZityMessage({
                error: true,
                body: `error en guardar`,
                name: title
            });
        }
        return
    }

    // console.log("webConfigurationModal", type, mode, pageData)
    // if (typeof pageData.web == "undefined" || pageData.web == "") {
    //     viewMainMessage(
    //         "error",
    //         "<p>La página debe pertenecer a una web para poder guardar esta configuración"
    //     );
    //     return;
    // }
    // let lint, modalTitle;
    // if (mode === "javascript"){
    //     modalTitle = "main-script.js"
    //     lint = {
    //         esversion: 6,
    //         async: true
    //     }
    // }
    // else if (mode === "css") {
    //     modalTitle = "global-style.css"
    //     lint = true
    // }
   
    // const modal = document.createElement("div");
    // modal.setAttribute("class", "ui modal");
    // modal.setAttribute("id", "webConfigurationModal");
    
    // modal.style.height = "100vh";
    // modal.style.width = "100vw";
    // modal.style.margin = "0";
    // modal.style.left = "0";
    // modal.style.top = "0";
    // modal.style.overflow = "hidden";
    // modal.style.borderRadius = "0";
    // modal.style.background = "#3a3a3a";

    // modal.innerHTML = `
    //     <div style="padding: 10px;font-family: monospace;color: #ffc107;border-radius: 0;font-weight: 100;font-size: 1.1em;">${modalTitle}</div>
    //     <div id="CMeditor" style="height: calc(100vh - 90px); font-size: 12px;"></div>
    //     <div class="extra content" style="padding: 10px;font-family: monospace; border-radius: 0;font-weight: 100;background: #3a3a3a;">
    //         <button class="ui small green button" onclick="saveWebConfiguration('${type}');">GUARDAR</button>
    //         <button class="ui small button" onclick="$('#webConfigurationModal').modal('hide');">CERRAR</button>
    //     </div>
    // `;

    // let cm = CodeMirror(
    //     modal.querySelector("#CMeditor"), {
    //         mode: mode,
    //         theme: "monokai",
    //         lineNumbers: true,
    //         matchBrackets: true,
    //         autoCloseBrackets: true,
    //         lineWrapping: true,
    //         foldGutter: true,
    //         gutters: [
    //             "CodeMirror-lint-markers", 
    //             "CodeMirror-linenumbers", 
    //             "CodeMirror-foldgutter"
    //         ],
    //         lint: lint
    //     }
    // );


    // getWebData(pageData.web).then(function(_webData) {
    //     const value = _webData[type] || "";
    //     cm.setSize(null, "inherit");
    //     cm.setValue(value);

    //     document.body.insertBefore(modal, document.body.firstChild);

    //     $(modal).modal({
    //         onVisible: function() {
    //             cm.refresh();
    //         },
    //         onHidden: function() {
    //             $('#webConfigurationModal').remove();
    //         },
    //         closable: false
    //     }).modal('toggle');
    // });
}

async function ZityModal(options) {
    const { value , mode, title, onsave, callback, lastModified} = options
    let lint;
    if (mode === "css") {
        lint = true;
    }else {
        lint = {
            esversion: 6,
            async: true
        }
    }
    
    const closeModal = ()=> $(modal).modal('hide');
    const saveValue = async () => {
        let success;
        const value = cm.getValue().trim();
        if(typeof onsave === "function"){
            success = onsave(value)
        }
        if(typeof callback === "function"){
            success = callback(value);
        }

        return success
    }

    let bgColor = themeMode == 'dark' ? "#3a3a3a" : "#ccdee4";
    let textColor = themeMode == 'dark' ? "#ffc107" : "#a61b74";

    const modal = document.createElement("div");
    modal.setAttribute("class", "ui modal");
    modal.setAttribute("id", "webConfigurationModal");
    
    modal.style.height = "100vh";
    modal.style.width = "100vw";
    modal.style.margin = "0";
    modal.style.left = "0";
    modal.style.top = "0";
    modal.style.overflow = "hidden";
    modal.style.borderRadius = "0";
    modal.style.background = bgColor;
    let date;
    if(lastModified)
        date = `<span style="float:right;font-size: .9em;">${lastModified}</span>`

    modal.innerHTML = `
        <div style="padding: 10px;font-family: monospace;color: ${textColor};border-radius: 0;font-weight: 100; font-size: 1.1em;">${title}${date || ''}</div>
        <div id="CMeditor" style="height: calc(100vh - 90px); font-size: 14px;line-height: 17px;"></div>
    `;
    const extraContent = document.createElement("div")
    extraContent.className = "extra content";
    extraContent.style.background = bgColor;
    extraContent.style.fontWeight = "100";
    extraContent.style.borderRadius = "0";
    extraContent.style.padding = "10px";
    extraContent.style.fontFamily = "monospace";

    const btnSave = document.createElement("button");
    btnSave.className = "ui small green button";
    btnSave.innerHTML = "GUARDAR";

    btnSave.addEventListener("click", saveValue);

    const btnClose = document.createElement("button");
    btnClose.className = "ui small button";
    btnClose.innerHTML = "CANCELAR";
    btnClose.addEventListener("click", ()=> {
        cm.setValue("")
        closeModal()
    })

    const btnSaveClose = document.createElement("button");
    btnSaveClose.className = "ui small blue button";
    btnSaveClose.innerHTML = "GUARDAR & CERRAR";
    btnSaveClose.addEventListener("click", async ()=> {
            const saved = await saveValue()
            if(saved) closeModal()
    });
    
    extraContent.appendChild(btnSave);
    extraContent.appendChild(btnSaveClose);
    extraContent.appendChild(btnClose);
    modal.appendChild(extraContent);

    let theme = themeMode == 'dark' ? "monokai" : "default";

    let cm = CodeMirror(
        modal.querySelector("#CMeditor"), {
            mode: mode,
            theme: theme,
            lineNumbers: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            lineWrapping: true,
            foldGutter: true,
            gutters: [
                "CodeMirror-lint-markers", 
                "CodeMirror-linenumbers", 
                "CodeMirror-foldgutter"
            ],
            lint: lint,
            extraKeys: {
                "Esc": function(cm) {
                    cm.setValue("")
                    $(modal).modal('hide');
                },
            }  
        }
    );
 
    cm.setSize(null, "inherit");
    cm.setValue(value || "");
    
    document.body.insertBefore(modal, document.body.firstChild);

    $(modal).modal({
        onVisible: function() {
            cm.refresh();
        },
        onHidden: function() {
            $('#webConfigurationModal').remove();
        },
        closable: false
    }).modal('toggle');
 }

// //Guarda los datos de la web en el API
// async function saveWebConfiguration(type) {
//     var cm = document.getElementById("CMeditor").firstChild.CodeMirror;
//     var _value = cm.getValue();
//     getWebData(pageData.web).then(function(webData) {
//         webData[type] = _value;
//         if (!webData.owners || webData.owners.lenght < 1) {
//             webData.owners = new Array;
//             webData.owners.push(USERDATA._id);
//         }
//         if (webData._id) {
//             try {
//                 doAjax(API + getRealm() + "/collections/webs/" + webData._id, "PUT", "json", webData);
//                 viewMainMessage("positive", "<p>Datos guardados correctamente</p>");
//             } catch (e) {
//                 console.log(e);
//             }
//         } else {
//             if (!webData.web || webData.web === "")
//                 webData.web = pageData.web;
//             try {
//                 doAjax(API + getRealm() + "/collections/webs", "POST", "json", webData);
//                 viewMainMessage("positive", "<p>Datos guardados correctamente</p>");
//             } catch (e) {
//                 console.log(e);
//             }
//         }
//         cm.setValue("");
//         $('#webConfigurationModal').modal('hide');
//     });
// }

async function openDefaultModal(type, dataType) {
    //console.log(pageData)
    
    
    let modalValue, 
        modalTitle = "",
        checkValue;

    if (dataType === "datasources") {
        checkValue = true;
        if (pageData.datasources)
            try {
                modalValue = JSON.stringify(JSON.parse(pageData.datasources), null, 2);
                modalTitle = "datasources.json";
            }
            catch(e) {
                console.error(e, "[datasources]")
                alert("ERROR EN JSON")
            }
    }
    else if (dataType === "javascript") {
        if (!pageData["user-scripts"]){
            pageData["user-scripts"] = "";
        }
            modalValue = pageData["user-scripts"];
            modalTitle = "script.js";
    }
    // Es un objeto donde cada campo está stringificado
    else if (dataType === "stringify") { 
        checkValue = true;
        if (selectedItem) {
            let json = segment_toJson(selectedItem);
            let obj={}
            try {
                Object.keys(json).forEach(key=>{
                    if(json._ref){
                        if(["className", "_ref", "dataid"].includes(key)) 
                            obj[key] = json[key]
                    }else if (['consumer','code','slots','localized'].includes(key)) obj[key]=obj[key]=JSON.parse(json[key])
                    else obj[key]=json[key]
                })
                modalValue = JSON.stringify(obj, null, 2);
                modalTitle = "selected-segment.json";
            }
            catch(e) {
                alert("error en JSON.parse",json)
                console.log(json)
            }
        }
    }
    else if (dataType === "css") {
        if (!pageData.style){
            pageData.style = ""
        }
        modalValue = pageData.style;
        modalTitle = "style.css";
    }
    else if (dataType === "pageJSON") {
        checkValue = true;
        const nodo = mainPage.getElementById('main').children;
        const json = segment_toJson(nodo);
        modalValue = JSON.stringify(json, null, 2);
        modalTitle = "page.json";
    }
    else if (dataType == "selectedJSON") {
        checkValue = true;
        if (selectedItem) {
            const json = segment_toJson(selectedItem);
            modalValue = JSON.stringify(json, null, 2);
            modalTitle = "selected.json";
        }
    }
    // Editar el contenido como código JS
    else if (dataType === "source") {  
        if (selectedItem && selectedItem.dataset && selectedItem.dataset.source) {
            modalValue = selectedItem.dataset.source;
        }
        modalTitle = "source.json";
    }
    else if (dataType === "segmentCSS") {
        let segmentJSON = segment_toJson(selectedItem);
        if (segmentJSON.components) {
            let resultado = segmentJSON.components.find(comp => comp.name === 'style');
            modalValue = resultado.value
            modalTitle = "segment-style";
        }
    }
    else if (dataType === "translation") {
        checkValue = true;
        let text = selectedItem.innerHTML.replace(/\n|\s\s/g, '');

		let localized;
		if (selectedItem.dataset.localized) {
			//console.log(selectedItem.dataset.localized);
            localized = JSON.parse(selectedItem.dataset.localized);
		}
		else
		{
            let text = selectedItem.innerHTML.trim();  // !!!!??? esto que es???
        	localized = {
	            und: text
	        };
		}
        modalValue = localized
        modalTitle = "localize";
    }

    let webName;
    if(pageData.web)
        webName = pageData.web.toLowerCase().replace(/\s/g, "-");
    else
        webName = 'sin-web';

    ZityModal({
        value: modalValue, 
        mode: type,
        title: webName + ": " + pageData.name + " > " + modalTitle,
        onsave: (value) => {
            //console.log(type, dataType, value)
            if(checkValue){
                try{
                    JSON.parse(value)
                }catch(e){
                    alert(e);                
                    return false
                }
            }
            activeSavePageButton()
            saveDefaultModal(dataType, value, modalTitle)
            return true
        }
    })
}

// async function openDefaultModal(type, dataType) {
//     var modal = document.createElement("div");
//     var gutters = ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "CodeMirror-foldgutter"];
//     var options = {
//         mode: type,
//         theme: "monokai",
//         lineNumbers: true,
//         matchBrackets: true,
//         autoCloseBrackets: true,
//         lineWrapping: true,
//         foldGutter: true,
//         gutters,
//         lint: type === "javascript" ? {
//             esversion: 6,
//             async: true
//         } : true,
//         extraKeys:{"Ctrl-S":function(e) {saveDefaultModal(dataType)}}
//     };

//     modal.setAttribute("class", "ui fullscreen modal");
//     modal.setAttribute("id", "defaultModal");
//     modal.innerHTML = `
//         <i class="close icon"></i>
//         <div class="header">Editor JSON</div>
//         <div class="content">
//             <button class="ui right floated button" id="copiarContenido">Copiar datos</button>
//             <h4 class="ui middle aligned header">${dataType.toUpperCase()} de la página</h4>
//             <div class="ui divider"></div>
//             <div class="ui stackable grid">
//                 <div class="twelve wide column">
//                     <div id="CMeditorDefault-${dataType}"  tabindex="0"></div>
//                 </div>
//                 <div class="four wide column" id="defaultModalInfo">
//                     <h4>INFO</h4>
//                 </div>
//             </div>
//         </div>
//         <div class="extra content">
//             <button class="ui green button" onclick="saveDefaultModal('${dataType}');">Guardar</button>
//             <button class="ui button" onclick="$('#defaultModal').modal('hide');">Cerrar</button>
//             <textarea id="infoJsonCopy" style="display: none;"></textarea>
//         </div>
//         `;

//     var cm = CodeMirror(modal.querySelector(`#CMeditorDefault-${dataType}`), options);
//     cm.setSize(null, 500);
//     document.body.insertBefore(modal, document.body.firstChild);
//     if (dataType === "datasources") {
//         if (pageData.datasources)
//             try {
//                 cm.setValue(JSON.stringify(JSON.parse(pageData.datasources), null, 2));
//             }
//             catch(e) {
//                 alert("ERROR EN JSON")
//             }
//     }
//     else if (dataType === "javascript") {
//         if (pageData["user-scripts"])
//             cm.setValue(pageData["user-scripts"]);
//     }
//     else if (dataType === "stringify") { // Es un objeto donde cada campo está stringificado
//         if (selectedItem) {
//             let json = segment_toJson(selectedItem);
//             let obj={}
//             // descomprimimos campos identificados como JSON.
//             try {
//                 Object.keys(json).forEach(key=>{
//                     if (['consumer','code','slots','localized'].includes(key)) obj[key]=obj[key]=JSON.parse(json[key])
//                     else obj[key]=json[key]
//                 })
//                 cm.setValue(JSON.stringify(obj, null, 2));
//             }
//             catch(e) {
//                 alert("error en JSON.parse",json)
//                 console.log(json)
//             }
//         }
//     }
//     else if (dataType === "css") {
//         if (pageData.style)
//             cm.setValue(pageData.style);
//     }
//     else if (dataType === "pageJSON") {
//         var nodo = mainPage.getElementById('main').children;
//         let json = segment_toJson(nodo);
//         cm.setValue(JSON.stringify(json, null, 2));
//     }
//     else if (dataType == "selectedJSON") {
//         if (selectedItem) {
//             let json = segment_toJson(selectedItem);
//             cm.setValue(JSON.stringify(json, null, 2));
//         }
//     }
//     else if (dataType === "source") {  /// Editar el contenido como código JS
//         if (selectedItem) {
//             selectedItem.dataset && selectedItem.dataset.source && cm.setValue(selectedItem.dataset.source);
//         }
//     }
//     else if (dataType === "segmentCSS") {
//         let segmentJSON = segment_toJson(selectedItem);
//         if (segmentJSON.components) {
//             let resultado = segmentJSON.components.find(comp => comp.name === 'style');
//             cm.setValue(resultado.value)
//             // if (resultado && resultado.value) {
//             //     var expresion = new RegExp(/\[data-id='(?:\w)+'\] */g);
//             //     cm.setValue(resultado.value.replace(expresion, ""));
//             // }
//         }
//     }
//     else if (dataType === "translation") {
//         let text = selectedItem.innerHTML.replace(/\n|\s\s/g, '');

// 		let localized;
// 		if (selectedItem.dataset.localized) {
// 			//console.log(selectedItem.dataset.localized);
//             localized = JSON.parse(selectedItem.dataset.localized);
// 		}
// 		else
// 		{
//             let text = selectedItem.innerHTML.trim();  // !!!!??? esto que es???
//         	localized = {
// 	            und: text
// 	        };
// 		}

//         cm.setValue(JSON.stringify(localized, null, 2));

//         /// EL API de Apertium ha dejado de funcionar. !!!!! Habrá que instalar un apertium en local
//         // Hay otro dialogo de traducción que traduce todas los textos de una paǵina

//         /*
//         document.getElementById("defaultModalInfo").innerHTML = `
//             <button class="ui fluid button translate" data-from="es" data-to="va">De castellano a valenciano</button>
//             <div class="ui divider"></div>
//             <button class="ui fluid button translate" data-from="va" data-to="es">De valencià a castellà</button>
//             <div id="resultTranslation" style="overflow-y: auto;"></div>
//         `;
//         $('#defaultModal .translate').on('click', async function() {
//             let from = this.dataset.from;
//             let to = this.dataset.to;
//             let resultDiv = document.getElementById("resultTranslation");
//             resultDiv.innerHTML = `
//             <div class="ui icon message">
//                 <i class="sync loading inverted icon"></i>
//                 <div class="content">
//                     <div class="header">Traduciendo</div>
//                 </div>
//             </div>`;
//             let text = localized[from] && localized[from] != '' ? localized[from] : localized.und;
//             let traduccion = await translateApertium({ text: text, from: from, to: to });
//             if (traduccion) {
//                 localized[to] = traduccion.translation;
//                 cm.setValue(JSON.stringify(localized, null, 2));
//                 cm.refresh();
//                 resultDiv.innerHTML = `
//                     <div class="ui icon positive message">
//                         <i class="thumbs up icon"></i>
//                         <div class="content">
//                             <div class="header">Traducido</div>
//                         </div>
//                     </div>`;
//             } else {
//                 resultDiv.innerHTML = `
//                     <div class="ui icon negative message">
//                         <i class="thumbs down icon"></i>
//                         <div class="content">
//                             <div class="header">Error en la traducción</div>
//                         </div>
//                     </div>`;
//             }
//         });
//         */
//     }
//     else if (dataType === 'webDependencies') {
//         let webData = await getWebData(pageData.web);
//         var dependencies = webData.dependencies || { css: [], js: [] };
//        cm.setValue(JSON.stringify(dependencies, null, 2));
//     }

//     $(modal).modal({
//         onVisible: function() {
//             cm.refresh();
//         },
//         onHidden: function() {
//             $('#defaultModal').remove();
//         },
//         closable: false
//     }).modal('show');

//     document.getElementById("copiarContenido").addEventListener("click", function() {

//         //console.log("CLICK copiarcontenido")

//         var aux = document.createElement("input");
//         aux.setAttribute("value", cm.getValue());
//         document.body.appendChild(aux);
//         aux.select();
//         cm.execCommand("selectAll");
//         document.execCommand("copy");
//         document.body.removeChild(aux);
// //        console.log("Contenido Copiado")
//     });
// }

function saveDefaultModal(type, _value, title) {
    let status = true,
        showMessage = false;

    if (_value === ""){
        alert('Contenido vacio');
        return;
    }
    if (type == "datasources") {
        try {
            // Comprobamos errores
            pageData.datasources = JSON.stringify(JSON.parse(_value));
        } catch (e) {
            alert(e);
            status = false;
        }
    }
    else if (type == "javascript"){
        pageData["user-scripts"] = _value;
    }else if (type == "css"){
        pageData.style = _value;
    }else if (type == "pageJSON") {
        try {
            pageData.segments = JSON.parse(_value);
        } catch (e) {
            alert(e);
            status = false;
        }
    }
    else if (type == "selectedJSON") {
        try {
            let json = JSON.parse(_value);
            replaceNodo(json);
        } catch (e) {
            alert("Error en el formato JSON");
            console.log(e,_value);
            status = false;
        }
    }
    else if (type == "stringify") {
        try {
            let json = JSON.parse(_value);

            // Cambiamos los objetos por strings JSON
            Object.keys(json).forEach(key=>{
                if (['consumer','code','slots','localized'].includes(key)) {
                    let p=JSON.stringify(json[key])
                    json[key]=p
                }
            })
            replaceNodo(json);
        } catch (e) {
            alert("Error en el formato JSON");
            console.log(e,_value);
            status = false;
        }
    }
    else if (type == "source") {
        selectedItem.dataset.source =_value
    } 
    else if (type == "translation") {
        selectedItem.dataset.localized = _value;
    } 
    else if (type == "segmentCSS") {
        var expresion = new RegExp(/(.+{)/g);
        var id = selectedItem.dataset.id;
        var newstyle = _value;
        if (selectedItem.querySelector("style")) {
            selectedItem.querySelector("style").innerHTML = newstyle;
        } else {
            var globalStyle = document.createElement("style");
            globalStyle.innerHTML = newstyle;
            prepend(selectedItem, globalStyle);
        }
        try {
            let json = segment_toJson(selectedItem);
            replaceNodo(json);
        } catch (e) {
            alert("Error en el formato");
            console.log(e);
            status = false;
        }
    } 
    else {
        try {
            const nodo = segment_toJson(document.getElementById("main").children);
            pageData.segments = nodo;
            renderPage(pageData);
        } catch (e) {
            alert("Error en el formato");
            console.log(e);
            status = false;
        }
    }

    if(status){
        ZityMessage({
            success: true,
            name: title ? title : type,
            body: "actualizado"
        });
    }else{
        ZityMessage({
            error: true,
            name: title ? title : type,
            body: "error en actualizar"
        });
    }
    m.redraw()
}

// function saveDefaultModal(type) {
//     console.log(type)
//     // var cm = document.getElementById(`CMeditorDefault-${type}`).firstChild.CodeMirror;
//     var cm = document.getElementById("CMeditor").firstChild.CodeMirror;
//     var _value = cm.getValue();

//     if (cm.state.lint && cm.state.lint.marked.length) {
//         alert('El formato es incorrecto.');
//         return;
//     }

//    // console.log(type)
//     var status = true;
//     var _value = cm.getValue().trim();

//     if (_value === "")
//     {
//         alert('Contenido vacio');
//         return;
//     }

//     if (type == "datasources") {
//         try {
//             pageData.datasources = JSON.stringify(JSON.parse(_value));  // Comprobamos errores
//         } catch (e) {
//             alert(e);
//             status = false;
//         }
//     }
//     else if (type == "javascript"){
//         pageData["user-scripts"] = _value;
//     }else if (type == "css"){
//         pageData.style = _value;
//     }else if (type == "pageJSON") {
//         try {
//             pageData.segments = JSON.parse(_value);
//         } catch (e) {
//             alert(e);
//             status = false;
//         }
//     }
//     else if (type == "selectedJSON") {
//         try {
//             let json=JSON.parse(_value);
//             replaceNodo(json);
//         } catch (e) {
//             alert("Error en el formato JSON");
//             console.log(e,_value);
//             status = false;
//         }
//     }
//     else if (type == "stringify") {
//         console.log("stringify")
//         try {
//             let json=JSON.parse(_value);

//             // Cambiamos los objetos por strings JSON
//             Object.keys(json).forEach(key=>{
//                 if (['consumer','code','slots','localized'].includes(key)) {
//                     let p=JSON.stringify(json[key])
//                     json[key]=p
//                 }
//             })
//             //console.log('JSON: ', json)
//             replaceNodo(json);
//         } catch (e) {
//             alert("Error en el formato JSON");
//             console.log(e,_value);
//             status = false;
//         }
//     }
//     else if (type == "source") {
//         selectedItem.dataset.source =_value
//     } 
//     else if (type == "translation") {
//         selectedItem.dataset.localized = _value;
//     } 
//     else if (type == "segmentCSS") {
//         var expresion = new RegExp(/(.+{)/g);
//         var id = selectedItem.dataset.id;

//         //var newstyle = _value.replace(expresion, `[data-id='${id}'] $1`);
//         var newstyle = _value;
//         if (selectedItem.querySelector("style")) {
//             selectedItem.querySelector("style").innerHTML = newstyle;
//         } else {
//             var globalStyle = document.createElement("style");
//             globalStyle.innerHTML = newstyle;
//             prepend(selectedItem, globalStyle);
//         }
//         try {
//             let json = segment_toJson(selectedItem);
//             replaceNodo(json);
//         } catch (e) {
//             alert("Error en el formato");
//             console.log(e);
//             status = false;
//         }
//     } 
//     else if (type == "pageJSON") {
//         try {
//             renderPage(pageData);
//         } catch (e) {
//             alert("Error en el format JSON");
//             console.log(e);
//             status = false;
//         }
//     } 
//     else if (type == 'webDependencies') {
//         if (cm.state.lint && cm.state.lint.marked.length) {
//             alert('El formato es incorrecto.');
//         }
//         getWebData(pageData.web).then(function(webData) {
//             if (!webData.web || webData.web == '')
//                 webData.web = pageData.web;
//             if (!webData.owners || webData.owners.lenght < 1) {
//                 webData.owners = new Array;
//                 webData.owners.push(USERDATA._id);
//             }
//             webData.dependencies = isJson(_value) ? JSON.parse(_value) : {};
//             if (webData._id) {
//                 try {
//                     doAjax(API + getRealm() + "/collections/webs/" +webData._id, "PUT", "json", webData);
//                     viewMainMessage("positive", "<p>Datos guardados correctamente</p>");
//                 } catch (e) {
//                     console.log(e);
//                 }
//             } else {
//                 try {
//                     doAjax(API + getRealm() + "/collections/webs", "POST", "json", webData);
//                     viewMainMessage("positive", "<p>Datos guardados correctamente</p>");
//                 } catch (e) {
//                     console.log(e);
//                 }
//             }
//         });
//     } 
//     else {
//         try {
//             var nodo = segment_toJson(document.getElementById("main").children);
//             pageData.segments = nodo;
//             renderPage(pageData);
//         } catch (e) {
//             alert("Error en el formato");
//             console.log(e);
//             status = false;
//         }
//     }
//     if (status === true) {
//         $('#defaultModal').modal('hide');
//     }
//}


function webFaviconModal() {
    getWebData(getRealm(),pageData.web).then(function(webData) {
        var favicon = webData.favicon || "";
        var modal = document.createElement("div");
        modal.setAttribute("class", "ui modal");
        modal.setAttribute("id", "faviconModal");
        modal.innerHTML = `
        <i class="close icon"></i>
        <div class="header">Favicon general de la Web</div>
        <div class="content">
            <div class="ui form">
                <div class="field">
                    <input type="text" id="faviconURL"/>
                </div>
            </div>
        </div>
        <div class="extra content">
            <button class="ui green button" onclick="saveWebFavicon();">Guardar</button>
            <button class="ui button" onclick="$('#faviconModal').modal('hide');">Cerrar</button>
        </div>`;

        document.body.insertBefore(modal, document.body.firstChild);

        $(modal).modal({
            onVisible: function() {
                document.getElementById("faviconURL").value = favicon;
            },
            onHidden: function() {
                $('#faviconModal').remove();
            },
            closable: false
        }).modal('show');
    });
}

function saveWebFavicon() {
    var favicon = document.getElementById("faviconURL").value;
    getWebData(getRealm(),pageData.web).then(function(webData) {
        webData.favicon = favicon;
        if (webData._id) {
            try {
                doAjax(API + getRealm() + "/collections/webs/" + webData._id, "PUT", "json", webData);
                ZityMessage({
                    success: true,
                    name: "favicon-web",
                    body: "guardado"
                });
            } catch (e) {
                console.log(e);
            }
        } else {
            try {
                doAjax(API + getRealm() + "/collections/webs", "POST", "json", webData);
                ZityMessage({
                    error: true,
                    name: "favicon-web",
                    body: "error en actualizar"
                });
            } catch (e) {
                console.log(e);
            }
        }
        $('#faviconModal').modal('hide');
    });
}

function openPageTranslationsModal() {
    var modal = document.createElement("div");
    var gutters = ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "CodeMirror-foldgutter"];
    var options = {
        mode: "javascript",
        theme: "monokai",
        lineNumbers: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        lineWrapping: true,
        foldGutter: true,
        gutters,
        lint: {
            esversion: 6,
            async: true
        }
    };
    modal.setAttribute("class", "ui fullscreen modal");
    modal.setAttribute("id", "pageTranslationsModal");
    modal.innerHTML = `
        <i class="close icon"></i>
        <div class="header">Traducciones de la página</div>
        <div class="content">
            <div class="ui grid">
                <div class="twelve wide column">
                    <div id="translationsEditor"></div>
                </div>
                <div class="four wide column">
                    <button class="ui fluid button translate" data-from="es" data-to="va">De castellano a valenciano</button>
                    <div class="ui divider"></div>
                    <button class="ui fluid button translate" data-from="va" data-to="es">De valencià a castellà</button>
                    <div id="resultTranslation" style="overflow-y: auto;"></div>
                </div>
            </div>
        </div>
        <div class="extra content">
            <button class="ui green button" onclick="savePageTranslationsModal();">Guardar</button>
            <button class="ui button" onclick="$('#pageTranslationsModal').modal('hide');">Cerrar</button>
        </div>`;
    var cm = CodeMirror(modal.querySelector("#translationsEditor"), options);
    let simples = $("[data-component='dv-simple']");
    let l = simples.length;
    let _values = [];
    let idsArray = [];
    if (l > 0) {
        for (let i = 0; i < l; i++) {
            let el = simples[i];
            let id = el.dataset.id;
            let tag = el.tagName;
			let localized;
			if (el.dataset.localized) {

				//console.log(el.dataset.localized);
	            localized = JSON.parse(el.dataset.localized);
			}
			else
			{
				// Esto mismo está repetido mas adelante. Eliminar una de las dos.!!!!!!!!!!!!!!!
	            let text = el.innerHTML.trim();
	        	localized = {
		            und: text,
		            va: {},
		            es: {}
		        };
			}
            if (id && tag != 'IMG' && tag != 'IFRAME') {
                while (idsArray.includes(id)) {
                    let newId = Math.floor(Math.random() * (9999 - 1)) + 1;
                    if (!idsArray.includes(newId)) {
                        id = newId;
                        el.dataset.id = id;
                    }
                }
                idsArray.push(id);
                _values.push({
                    id: id,
                    localized: localized
                });
            }
        }
    }
    cm.setSize(null, 500);
    cm.setValue(JSON.stringify(_values, null, 2));
    document.body.insertBefore(modal, document.body.firstChild);
    $(modal).modal({
        onVisible: function() {
            cm.refresh();
        },
        onHidden: function() {
            $('#pageTranslationsModal').remove();
        },
        closable: false
    }).modal('show');
    $('#pageTranslationsModal .translate').on('click', async function() {
        let from = this.dataset.from;
        let to = this.dataset.to;
        let l = _values.length;
        let resultDiv = document.getElementById("resultTranslation");
        let errors = [];
        resultDiv.innerHTML = `
            <div class="ui icon message">
                <i class="sync loading inverted icon"></i>
                <div class="content">
                    <div class="header">Traduciendo</div>
                </div>
            </div>`;
        for (let i = 0; i < l; i++) {
            let val = _values[i];
            if (!val.localized[to] || val.localized[to] == '') {
                let text = val.localized[from] && val.localized[from] != '' ? val.localized[from] : val.localized.und;
                let traduccion = await translateApertium({ text: text, from: from, to: to });
                if (traduccion)
                    val.localized[to] = traduccion.translation;
                else
                    errors.push(val.id);
            }
        }
        cm.setValue(JSON.stringify(_values, null, 2));
        cm.refresh();
        resultDiv.innerHTML = `
            <div class="ui icon positive message">
                <i class="thumbs up icon"></i>
                <div class="content">
                    <div class="header">Traducido</div>
                </div>`;
        if (errors.length > 0) {
            resultDiv.innerHTML += `
                    <div class="extra content">
                        <div class="header">Errores</div>
                        <p>No se pudieron traducir los siguientes elementos:</p>
                        <div class="ui list">`;
            for (let i = 0; i < errors.length; i++) {
                resultDiv.innerHTML += `<div class="item">id: ${errors[i]}</div>`;
            }
            resultDiv.innerHTML += `</div></div>`;
        }
        resultDiv.innerHTML += `</div>`;
    });
}

async function translateApertium(data = { text: '', from: '', to: '' }) {
    let url = `https://public.digitalvalue.es/apertium/?text=${data.text}&from=${data.from}&to=${data.to}`;
    return await fetchJSON(url);
}

function savePageTranslationsModal() {
    let cm = document.getElementById("translationsEditor").firstChild.CodeMirror;
    let objList = JSON.parse(cm.getValue().trim());
    objList.map(function(obj) {
        let el = document.querySelector(`[data-id='${obj.id}']`);
        el.dataset.localized = JSON.stringify(obj.localized);
    });
    $('#pageTranslationsModal').modal('hide');
}

// Muestra el menú de edición de segmento o componente, y ajusta los paneles de información
// de acuerdo con el elemento seleccionado

function SegmentEditionContextMenu() {
    return {
        view:()=>{
            return [
                "MENU DE CONTEXTO",
                m("i.plus.icon"),
                m("i.minus.icon"),
                m("i.plus.icon"),
                m("i.plus.icon"),

            ]
        }
    }
}

// function createSegmentEditionMenu() {
//     // Vamos a montar el componente mithril
//     let menu=document.createElement("div")
//     menu.style.position="absolute"
//     menu.style.top=`${selectedItem.offsetTop-20}px`
//     menu.style.left=`${selectedItem.offsetLeft}px`;


//     // let anchor=selectedItem.insertAdjacentElement("beforebegin",menu)
//     m.mount(menu, SegmentEditionContextMenu)
//     console.log($(selectedItem),selectedItem.offsetTop,selectedItem.offsetLeft)
// }


// // Procesa las marcas style
// function cssProcess(style, form) {
//     var html = "";
//     for (rule of Object.keys(style))
//         if (typeof style[rule] !== "undefined" && style[rule] != null && style[rule] != "") {
//             if (form && form.elements && form.elements[rule])
//                 form.elements[rule].value = style[rule];
//             else
//                 html += `<div class='item'>${rule}=${style[rule]}</div>`;
//         } else {
//             if (form && form.elements && form.elements[rule])
//                 form.elements[rule].value = "";
//         }

//     return html;
// }

// function cssEditor() {
//     if (!selectedItem) return;
//     let style = selectedItem.style;
//     let oldstyle = JSON.stringify(style);
//     $('.cssProperties').off('keyup');
//     var html = "";
//     for (rule of Object.keys(style)) {
//         if (typeof style[rule] !== "undefined" && style[rule] != null && style[rule] != "" && isNaN(rule)) {
//             html += `<label>${rule}</label><input type="text" name="${rule}" value="${style[rule]}" class="cssProperties"/>`;
//         }
//     }
//     document.getElementById("cssEditor").innerHTML = html;
//     $('.cssProperties').keyup(function() {
//         selectedItem.style[this.name] = this.value;
//     });
//     /*
//         $('#revertirCSS').click(function() {
//             selectedItem.style = style;
//         });*/
// }

// function newAttributeCssEditor() {
//     let attrs = Object.keys(selectedItem.style);
//     let len = attrs.length;
//     let modal = document.createElement("div");
//     let html = '';
//     modal.setAttribute("class", "ui modal");
//     modal.setAttribute("id", "stylePropertiesModal");
//     html += `
//         <i class="close icon"></i>
//         <div class="header">Propiedades CSS</div>
//         <div class="scrolling content">
//             <form class="ui form" name="cssPropertiesList" id="cssPropertiesList">`;

//     for (let i = 0; i < len; i++) {
//         html += `
//             <div class="eight wide field">
//                 <div class="ui checkbox">
//                     <input type="checkbox" name="${attrs[i]}">
//                     <label>${attrs[i]}</label>
//                 </div>
//             </div>
//         `;
//     }
//     html += `
//             </form>
//         </div>
//         <div class="extra content">
//             <button class="ui green button" onclick="addCssAttributes();">Añadir</button>
//             <button class="ui button" onclick="$('#stylePropertiesModal').modal('hide');">Cerrar</button>
//         </div>`;
//     modal.innerHTML = html;
//     document.body.insertBefore(modal, document.body.firstChild);

//     function addCssAttributes() {
//         let form = document.forms.cssPropertiesList;
//         console.log(form);
//     }

//     $(modal).modal({
//         onHidden: function() {
//             $('#stylePropertiesModal').remove();
//         },
//         closable: false
//     }).modal('show');
// }

// function saveCssEditorData() {
//     let elements = document.forms.cssEditor.elements;
//     let len = elements.length;
//     if (len > 0) {
//         for (let i = 0; i < len; i++) {
//             let el = elements[i];
//             selectedItem.style[el.name] = el.value;
//         }
//     }
// }


//!!! esto debería funcionar, y sin embargo deja muchos segmentos inaccesibles

// function editionMode() {
//     let edition=false
//     $("#main").off("click", "*");
//     $("#main").attr("editionmode", "1");
//     $("#main").on("click", "*", function(e) {
//         if (!edition) {
//             edition=true
//             e.preventDefault();
//             e.stopPropagation();
//             selectedItem = this;
//             // Los segmentos por referencia no se pueden seleccionar.
//             if (this.closest("[data-ref]")) {
//                 selectedItem = this.closest("[data-ref]");
//             }
//             showEditionMenu();
//         }
//         else
//             edition=false
//     });
// }

/// !!! SE PUEDE QUITAR?????

function showEditionMenu() {
  //  console.log("showEditionMenu")

    $(".selected").removeClass("selected");
    $("#segment-edition-menu").hide();
    $("#selected-menu").hide();

    if (typeof selectedItem == "undefined") {
        console.log("selected==VACIO");
        return;
    }

    //Se asigna el elemento seleccionado
    var component = null;
  
    if (selectedItem.dataset && selectedItem.dataset.editor && selectedItem.dataset.editor === "component")
        component = selectedItem.dataset.component;
    else if (selectedItem.dataset && selectedItem.dataset.editor && selectedItem.dataset.editor === "segment") {

        $("#segment-edition-menu").show();

        // const segmentName = selectedItem.dataset.name
        // ? 'Segment: ' + selectedItem.dataset.name
        // : 'Segment';

        // $('#segment-name').text(segmentName)

    }
    else if (selectedItem.closest("[data-component]")) {
        component = selectedItem.closest("[data-component]").dataset.component;
        selectedItem = selectedItem.closest("[data-component]");
    } else
        return;
    //positionSelectedMenu(selectedItem)
    // var coord = $(selectedItem).offset();
    // var left = coord.left;
    // if (coord.left > $(window).width() / 2)
    //     left = coord.left + $(selectedItem).width() - 400;
    // $("#selected-menu").css({
    //     position: "absolute",
    //     top: coord.top - 40,
    //     left: left,
    //     display: "block",
    //     "z-index": 901
    // });

    //Se le añade la clase para que destaque
    addClass(selectedItem, "selected");

    // Le vamos a añadir el bloque de edición

    //Se muestra el cuadro de info
    // var info = document.getElementById("elementInfoMessage");
    // if (info.style.visibility === "hidden" || info.style.display === "none")
    //     info.style.display = "block";

    // document.getElementById("elementInfo").innerHTML = "<div>" + (selectedItem.dataset.ref ?
    //     `referencia<br><small>${selectedItem.dataset.ref}</small>` :
    //     selectedItem.dataset.component || selectedItem.dataset.editor || "desconocido") + "</div>";

    // Despliega los menus de edición que correspondan

    $(".editionMenu").hide();
    if ($("#selected-menu").is(":hidden"))
        $("#selected-menu").show();

    if (component !== null) $("#" + component + "-edition-menu").show();

    // Mostramos la información de CSS en la barra lateral

    //document.getElementById("selecteditemcss").innerHTML = cssProcess(selectedItem.style, document.getElementById("csseditorform"));
    /*document.getElementById("cssEditor").innerHTML = cssEditor(selectedItem.style);

    $('.cssProperties').keyup(function() {
        selectedItem.style[this.name] = this.value;
    });*/
    //cssProcess(selectedItem.style);

    // cssEditor();

    // repintamos

    //console.log("Redraw")
    m.redraw()
}

function editionMode() {
    $("#main").off("click", "*"); // Desactiva todos los eventos Click.
    $("#main").attr("editionmode", "1");
    $("#main").on("click", "*", function(e) {
        //console.log("AQUI")
        e.preventDefault();
        e.stopPropagation();
        selectedItem = this;
        // Los segmentos por referencia no se pueden seleccionar.
        if (this.closest("[data-ref]")) {
            selectedItem = this.closest("[data-ref]");
        }
       showEditionMenu();
    });
}


/*
    Funciones que manejan el DOM
*/

// Guardamos un historial para deshacer cualquier cambio

let undo=[]

function insertDom(el, content, position) {
    if (typeof el === "object") {
        if (typeof content === "object")
            el.insertAdjacentElement(position, content);
        else if (typeof content === "string")
            el.insertAdjacentHTML(position, content);
    }
    //ActualizarPagina()
}

function append(el, content) {
    insertDom(el, content, "beforeend");
    undo.push(()=>{console.log("append");console.log(el);el.remove()})

    //ActualizarPagina()
}

function prepend(el, content) {
    insertDom(el, content, "afterbegin");
    undo.push(()=>{console.log("append");console.log(el);})
    // undo.push(()=>el.remove())

    //ActualizarPagina()
}

function insertBefore(el, content) {
    insertDom(el, content, "beforebegin");
    undo.push(()=>el.remove())

    //ActualizarPagina()
}

function insertAfter(el, content) {
    insertDom(el, content, "afterend");
    undo.push(()=>el.remove())

    //ActualizarPagina()
}

function cloneElement(el) {
   // activeSavePageButton()
    var newNode = el.cloneNode(true);
    if (newNode.dataset.id)
        delete newNode.dataset.id;
    if (newNode.className && newNode.classList.contains("selected")) newNode.classList.remove("selected");
    if (el.nextSibling) el.parentNode.insertBefore(newNode, el.nextSibling);

    else el.parentNode.appendChild(newNode);
    //unselectItem();
    undo.push(()=>newNode.remove())
 //   ActualizarPagina()
    highlightElement(newNode)
}

/**Añade los atributos del objeto attrs al elemento el */
function set_attributes(el, attrs) {
    for (var key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

/**Elimina todos los hijos del nodo pasado por id */
function removeAllChilds(id) {
    var a = document.querySelector(id);
    while (a.hasChildNodes()) a.removeChild(a.firstChild);
}

function deleteElement(el) {
    /*
        if (el.dataset.component && el.dataset.component === "dv-input")
            el.closest(".field").remove();
        else el.remove();
    */
    activeSavePageButton()
    let parent = el.parentNode
    let sibbling = el.nextSibling
    let node = el.cloneNode(true)
    undo.push(()=>{
        parent.insertBefore(node, sibbling);
    }) // No se pondrá en el mismo sitio!!!!

    el.remove();
    
    let main = document.getElementById('main');
    let children = document.querySelector('#main > div, #main > section');
    //console.log(children)
    if(!children){
        const p = document.createElement("div");
        p.style.width = "100%";
        p.style.height = (main.clientHeight - 10) + "px";
        p.style.display = "flex";
        p.style.alignItems = "center";
        p.style.justifyContent = "center";

        let btn = document.createElement('button')
        btn.className = "ui huge teal button";
        btn.textContent = "+ Add Section"
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const newSegment = segment_render("section", {tag: "section", style: "padding: 0;min-height: 370px"});
            addChildren(newSegment)
            highlightElement(newSegment)
            document.getElementById('main').appendChild(newSegment)
            p.remove();
        })
        p.appendChild(btn)
        main.appendChild(p)
    }

    unselectItem();
   // ActualizarPagina()
}

function addContainerOutside() {
    // activeSavePageButton()
    let type = "";

    if (hasClass(selectedItem, "column")) type = "column";

    let nodo = segment_render(type)
    let column = segment_render("column", segment_toJson(selectedItem))

    if (type === "") {
        nodo.className = selectedItem.className
        column.className = "column";
        //addClass(column, classes);
    }
    //Quitamos el grid?
    let grid = nodo.querySelector(".grid")

    if(grid) grid.appendChild(column);
    else {
        let newGrid = document.createElement("div");
        newGrid.className = "ui equal width padded grid";
        newGrid.appendChild(column);
        nodo.appendChild(newGrid);
    }

    // !! no funciona bien deshacer. Elimina todos los segmentos agrupados
    let original = selectedItem.cloneNode()
    undo.push( nodo )

    selectedItem.replaceWith(nodo);
    //selectedItem = nodo.firstChild

    highlightElement(original)
    // original.classList.add("segment-added")
    // setTimeout( () => original.classList.remove("segment-added"), 4000);

    // undo.push(()=>alert("deshacer no está implementado para esta operación"))

    //unselectItem();
    //ActualizarPagina()
}

// Position: before/after/inside
function addContainer(elem, position) {
    activeSavePageButton()
    const parent = elem.closest("[data-editor='segment']");
    let type = ""
    let newNode = {};

    if(position !== 'inside'){
        //console.log('selected: ', selectedItem)
        //let type = selectedItem.classList.contains('container') ? "container" : "column";
        if(selectedItem.classList.contains('container')) type = "container"
        else if(selectedItem.classList.contains('card')) type = "card"
        else if(selectedItem.classList.contains('column')) type = "column"
        else if(selectedItem.classList.contains('row')) type = "row"
        else if(selectedItem.classList.contains('segment')) type = "segment"
        else type = "column"

        newNode = segment_render(type)
        // copia tipo y classname, y el tag del segmento seleccionado
        // console.log(elem)

        // let newNode = elem.cloneNode()
        // newNode.style.cssText = "padding:1rem";
        // if (newNode.dataset.id) delete newNode.dataset.id;
        // if (newNode.dataset.ref) delete newNode.dataset.ref;
        // if (newNode.dataset.name) delete newNode.dataset.name;
        // if (newNode.dataset.thumbnail) delete newNode.dataset.thumbnail;
        // if(newNode.hasAttribute('id')) newNode.removeAttribute('id')
        // if(newNode.hasAttribute('href')) newNode.removeAttribute('href')
        // if(newNode.hasAttribute('onlick')) newNode.removeAttribute('click')
        // if (newNode.className && newNode.classList.contains("selected")) newNode.classList.remove("selected");
        parent.insertAdjacentElement( position, newNode);
    }else{
        if(selectedItem.classList.contains('card')){
            //  image, content, extra content
            if(!selectedItem.querySelector(".image")) type = "image";
            else if(!selectedItem.querySelector(".content")) type = "content";
            else type = "extra content"
        }else if(selectedItem.classList.contains('cards')) type = "card"
        else if(selectedItem.classList.contains('segments')) type = "segment"
        else type = "column"

        var grid = elem.querySelector(".grid");
        if (!grid && !selectedItem.hasAttribute("data-type")) {
            grid = document.createElement("div");
            grid.setAttribute("class", "ui equal width padded grid");
            parent.appendChild(grid);
            grid.appendChild(segment_render(type));
        }else {
            newNode = segment_render(type)  //?????  // Y Si no es un grid???
            if(selectedItem.hasAttribute("data-type"))
                selectedItem.appendChild(newNode)
            else
                grid.appendChild(newNode);
        }
    }
    
    highlightElement(newNode)


    undo.push(()=>newNode.remove())
    //positionSelectedMenu(elem)

   // ActualizarPagina()
}

function highlightElement(el) {
    activeSavePageButton();
    if(el.style.background || el.style.backgroundColor) return
    let opacity = 1;
    let count = 0;
    el.style.backgroundColor = "rgba( 182, 221, 255, 1 )";
    let last = + new Date();
    const tick = () => {
        let newOp = opacity - count;
        el.style.backgroundColor = `rgba( 182, 221, 255, ${newOp})`;

        count = + count + (new Date() - last) / 400;
        last = + new Date();

        if (+count < 1) {
            (window.requestAnimationFrame && requestAnimationFrame(tick)) ||
            setTimeout(tick, 16);
        }else{
            el.style.backgroundColor = null;
        }
    };

    tick();

}

function addNewSection(elem, position) {
    //activeSavePageButton()
    const parent = elem.closest("[data-editor='segment']");

    const newNode = segment_render("section", {tag: "section", style: "padding: 0;min-height: 370px"});
       
    parent.insertAdjacentElement( position, newNode);
    
    undo.push(()=> newNode.remove());

    return newNode;
}

function addChildren(elem, fr) {
    const childList = segment_render("grid", {className: "ui container stackable equal width grid"});
    childList.style.minHeight = "inherit";

    switch(fr){
        case "1fr 1fr": 
            childList.appendChild(segment_render("column"));
            childList.appendChild(segment_render("column"));
        break;
        case "1fr 1fr 1fr":            
            childList.appendChild(segment_render("column"));
            childList.appendChild(segment_render("column"));    
            childList.appendChild(segment_render("column"));    
        break;
        case "1fr 1fr 1fr 1fr": 
            childList.appendChild(segment_render("column"));
            childList.appendChild(segment_render("column"));    
            childList.appendChild(segment_render("column"));  
            childList.appendChild(segment_render("column"));  
        break;
        case "1fr 2fr": 
            childList.appendChild(segment_render("column", {className: "five wide column"}));
            childList.appendChild(segment_render("column"));
        break;
        case "2fr 1fr": 
            childList.appendChild(segment_render("column"));
            childList.appendChild(segment_render("column", {className: "five wide column"}));
        break;
        case "1fr 2fr 1fr": 
            childList.appendChild(segment_render("column", {className: "four wide column"}));
            childList.appendChild(segment_render("column"));
            childList.appendChild(segment_render("column", {className: "four wide column"}));
        break;
    }

    elem.appendChild(childList);

    highlightElement(elem)
}

function removePageLoader(){
    document.getElementById("loader").style.display = "none"
}
function showPageLoader(){
    document.getElementById("loader").style.display = "flex"
}
