let REALM;
/*
    Funciones para la transformación de dom->json y json->dom de las páginas

MODELO DE ORGANIZACIÓN DEL ESPACIO
<div class="ui container fila" data-editor="segment" data-path="" data-id="">
	<div class='title' data-editor="text"></div>
	<div class='lead' data-editor="text"></div>
	<div class='components' data-editor='component'>Componente 1</div>
	<div class='components' data-editor='component'>Componente 2</div>
	<div class="ui equal width stackable grid" style="margin: 0px;">
[
		<div class='ui container column' data-editor="segment" data-path="" data-id="">Componentes hijo 1</div>
		<div class='ui container column' data-editor="segment" data-path="" data-id="">Componentes hijo 2</div>
]
	</div>
</div>

///!!!! cambiar por
m("row",
    m("column")
)
*/

var registeredComponents = [];

/*
Los componentes se añaden al array registeredComponents[]
Los ficheros de definición de componente crearán el objeto correspondiente
registeredComponents['dv-nombre'] = { new: function(...), render: function(...), menu: function(...)};
new: crea un nuevo componente devolviendo un objeto en formato javascript (json)
render: toma como argumento un componente en formato javascript (json) y devuelve el dom en modo edicion
menu: devuelve los elementos de menu para modificar el componente
toHTML: convierte el json en HTML
toJson: convierte del dom a json
*/


/**Construye un json con el árbol del DOM

segment
	name -> identificador/nombre del segmento
	_ref -> cargar otro segmento en vez del actual
	align -> alineación dentro del segmento (textalign)
	background -> imagen de fondo //NO SOPORTADO?????
	backgroundColor -> color de fondo

component
	name -> tipo de componente
	id -> identificador único del componente
	value -> contenido (innerHTML)
	isa	-> si el componente corresponde a un campo específico del modelo de datos
	href -> El componente enlaza
	className -> classes que se aplican al componente
	color -> color de fondo
	background -> imagen de fondo???
	image ->????

*/

var development=false

//
//  S E G M E N T O S
//

function segment_toJson(nodo) {

	if (nodo.getAttribute && nodo.getAttribute("data-editor") === "component") { //getAttribute no está definido cuando es Array
        return component_toJson(nodo);
    }

    else  if (nodo.children && nodo.getAttribute("data-editor") === "segment") {
        let children = [],
            components = [],
            attr,
            isa,
            newsegment = {};

        ///Añadimos los atributos del segmento
        // Atributos principales

        if (nodo.tagName!=="DIV") newsegment.tag = nodo.tagName.toLowerCase()

		// Segmentos que se comporten como componentes.
        if (nodo.hasAttribute("data-type"))
            newsegment["type"] = nodo.getAttribute("data-type");
        if (nodo.hasAttribute("data-thumbnail"))
            newsegment["thumbnail"] = nodo.getAttribute("data-thumbnail");
        if (nodo.hasAttribute("data-name"))
            newsegment["name"] = nodo.getAttribute("data-name");
        if (nodo.hasAttribute("data-for"))
            newsegment["for"] = nodo.getAttribute("data-for");
        if (nodo.hasAttribute("data-if"))
            newsegment["if"] = nodo.getAttribute("data-if");
        if (nodo.hasAttribute("id"))
            newsegment["id"] = nodo.getAttribute("id");
        if (nodo.hasAttribute("data-ref"))
            newsegment["_ref"] = nodo.getAttribute("data-ref");
        if (nodo.hasAttribute("data-href"))
            newsegment["href"] = nodo.getAttribute("data-href");
        if (nodo.hasAttribute("data-target"))
            newsegment["target"] = nodo.getAttribute("data-target");
        if (nodo.hasAttribute("style")) {
            //Se necesita hacer replace para quitar comillas dobles en la instrucción background-image: url("https://...")
            newsegment["style"] = nodo.getAttribute("style").replaceAll(/url\(\"(.+)\"\)/g, "url($1)")
        }
        if (nodo.hasAttribute("data-id"))
            newsegment["dataid"] = nodo.getAttribute("data-id");
        if (nodo.hasAttribute("title"))
            newsegment["title"] = nodo.getAttribute("title");
        if (nodo.hasAttribute("data-comments"))
            newsegment["comments"] = nodo.getAttribute("data-comments");

        // vale la pena guardar otros campos data todavía no implementados???

        if (nodo.className) {
            var savedClassName = nodo.className.replace(/selected/i, "");
            newsegment["className"] = savedClassName.trim();
        }

        for (var j = 0; j < nodo.children.length; j++) {

            let child = nodo.children[j];

            isa = child.getAttribute("data-isa") || "";
            attr = child.getAttribute("data-editor");
            if (isa && isa != "") {
                newsegment[isa] = child.innerHTML;
            } else if (attr && attr == "component") {
                components.push(component_toJson(child));
            } else if (attr && attr == "text") {
                //Esto lo usamos???
                components.push({
                    name: child.getAttribute("data-component") ||
                        child.getAttribute("data-name") ||
                        child.localName ||
                        "",
                    type: "text",
                    value: child.innerHTML
                });
            } else if (child.tagName && child.tagName === "STYLE") { //Guarda etiquetas style como componente
                components.push({
                    name: "style",
                    value: child.innerHTML
                });
            } else if (attr && attr == "segment") {
                //children = []
                children.push(segment_toJson(child));
            } else {
                // newsegment.segments.push(segment_toJson(child));
                // Si son muchos se pierden?????
                children = segment_toJson(child);
            }
        }

        // guardar los segmentos hijos
        if (components.length) newsegment.components = components;
        if (children.length) newsegment.segments = children;
        if (nodo.hasAttribute("data-ref")) newsegment.segments = [];
        return newsegment;
    }

    else if (nodo.children && nodo.children.length) { // otros hijos que estén dentro del marcas div grid (equal witdh grid)
        return segment_toJson(nodo.children)
    }

    // APLANA UN NIVEL???!!!!!!
    // Guarda todo lo que haya en el DOM.
	else if (nodo && typeof nodo.length !== "undefined" && nodo.length>0) {
        let segments=[]
        for (var i = 0; i < nodo.length; i++) {
            // Solo los segmentos. No guarda el código HTML por procesar
            if (nodo[i].getAttribute("data-editor") === "segment" && nodo[i].tagName !== "STYLE" && nodo[i].tagName !== "SCRIPT" && nodo[i].tagName !== "LINK")
                segments.push(segment_toJson(nodo[i]))
        }

        return segments;
    }

    else // ¿esto para qué???
    {
        //console.log("nodo ???",nodo)
        return []
    }
}

/*
    Crea un Segmento nuevo, en blanco o con los datos facilitados
    data contiene un único segmento
    path es el path del padre
    Devuelve el segmento creado
*/

function segment_render(type = "", data, path, edition=1) {

    //console.log("segment_render", data)
    if (!pageData.lastid) pageData.lastid = 0

    pageData.lastid++

    //if (typeof type == "undefined") type = "column";
    if (typeof path === "undefined") path = ""

    var locale = getLocale()
    var tag = data && data.tag || "div"
    if (data && data.href) tag = "a"
    var container = document.createElement(tag)
    // Compatibilidad
    // !!! podemos hacer merge del campo data.data con data para compatibilidad con el modelo anterior
    if (!container.style.padding) container.style.padding = "1rem"
    if (data && data.style && !data._ref) container.setAttribute("style", data.style)

    // Si se indica classname, y type, se han de mezclar las clases.

    let classes= []
    classes.push("ui")

    if (data && data.className)
        data.className.split(" ").forEach(c=>classes.push(c))

    //if (type && (type === "fila" || type === "row")) classes.push("container") // Compatibilidad

    if (type && (type === "fila")) classes.push("row") // Compatibilidad
    else if (type) type.split(" ").forEach(t=>classes.push(t))

    if (data && data.type)
        data.type.split(" ").forEach(c=>classes.push(c))
    let className = [...new Set(classes)].join(' ') // Unico

    if(type) {
        container.setAttribute("data-type", type)
    }
    container.setAttribute("class", className)

    if (data && data.comments) {
        const label = document.createElement("a");
        label.className = "ui right corner label";
        label.innerHTML = '<i class="ui comments icon"></i>';
        container.appendChild(label);
        container.style.position='relative' // para que se pueda pintar la etiqueta
    }

    set_attributes(container, {
        "data-editor": "segment",
        "data-path": path
    });

    // El contexto no se aplica para evaluar los if y los for
    if (edition) {
        if (data && data.for) {
            // var label
            // Añadimos el cuadro de for
            // label = document.createElement("span");
            // label.setAttribute("class", "ui yellow left attached label");
            // label.setAttribute("style", "width:3px;hight:100%;background:yellow;position: relative;");
            // container.setAttribute("style","box-shadow: 5px 5px 0 0 yellow inset") // !!!! Se guarda como style del segmento
            //container.appendChild(label);

            const label = document.createElement("span");
            // label.className = "ui yellow top left ribbon label";
            label.className = "dv-bucle-for";
            label.tabIndex = 0;
            // label.setAttribute("style", "height:27px;width:50px;position: relative;");
            label.dataset.message = `${data.for}`;
            label.innerHTML = 'for';
            container.appendChild(label);

            label.addEventListener('click', function(e) {
                //$(this).toggleClass('active')
                let dialog = document.getElementById("segment-tooltip")
                dialog.innerHTML = "for: " + this.dataset.message;
                dialog.open = true;
            })
            label.addEventListener('blur', function(e) {
               // $(this).removeClass('active')
               let dialog = document.getElementById("segment-tooltip");
               dialog.innerHTML = "";
                dialog.close();
            })
        }

        if (data && data.if) {
            const label = document.createElement("span");
            label.tabIndex = 0;
            // label.className = "ui yellow right ribbon label";
            label.className = "dv-controlador-if";
            // label.setAttribute("style", "left: calc( 100% - 3.3em);");
            label.dataset.message = `${data.if}`;
            label.innerHTML = 'if';
            container.appendChild(label);
            label.addEventListener('click', function(e) {
                //$(this).toggleClass('active')
                let dialog = document.getElementById("segment-tooltip")
                dialog.innerHTML = "if: " + this.dataset.message;
                dialog.open = true;
            })
            label.addEventListener('blur', function(e) {
               // $(this).removeClass('active')
               let dialog = document.getElementById("segment-tooltip");
               dialog.innerHTML = "";
                dialog.close();
            })
        }

        if (true) {
            container.setAttribute("draggable", "true");
            container.addEventListener('dragstart', handleDragStart, false);
            container.addEventListener('dragenter', handleDragEnter, false)
            container.addEventListener('dragover', handleDragOver, false);
            container.addEventListener('dragleave', handleDragLeave, false);
            container.addEventListener('drop', handleDrop, false);
            container.addEventListener('dragend', handleDragEnd, false);
        }
    }

    if (data && data.if) container.setAttribute("data-if", data.if);
    if (data && data.id) container.setAttribute("id", data.id);

    if (data && data.dataid) container.setAttribute("data-id", data.dataid);
    else container.setAttribute("data-id", pageData.lastid);

    if (data && data.name) container.setAttribute("data-name", data.name);
    // if (type && type!=="fila") container.setAttribute("data-type", type);
    if (data && data.type) container.setAttribute("data-type", data.type);
    // if (data && data.thumbnail) container.setAttribute("data-thumbnail", data.thumbnail);
    if (data && data.for) container.setAttribute("data-for", data.for);
    if (data && data.href) container.setAttribute("data-href", data.href);
    if (data && data.target) container.setAttribute("data-target", data.target);
    if (data && data.comments) container.setAttribute("data-comments", data.comments);

    //en caso cuando segmento tiene href
    if (data && data.title && data.href) container.setAttribute("title", data.title);

    // if (data && data.title) {
    //     var h1 = registeredComponents["dv-simple"].render({
    //             tag: "h1",
    //             value: getLocalized(data.title, locale)
    //         },
    //         path + ".title." + locale
    //     );
    //     set_attributes(h1, {
    //         "data-isa": "title"
    //     });
    //     container.appendChild(h1);
    // }

    // if (data && data.subtitle) {
    //     var h2 = registeredComponents["dv-simple"].render({
    //             tag: "h2",
    //             value: getLocalized(data.subtitle, locale)
    //         },
    //         path + ".subtitle." + locale
    //     );
    //     set_attributes(h2, {
    //         "data-isa": "subtitle"
    //     });
    //     container.appendChild(h2);
    // }

    // if (data && data.lead) {
    //     var lead = registeredComponents["dv-simple"].render({
    //             tag: "h3",
    //             value: getLocalized(data.lead, locale)
    //         },
    //         path + ".lead." + locale
    //     );
    //     set_attributes(lead, {
    //         "data-isa": "lead"
    //     });
    //     container.appendChild(lead);
    // }

    if (data && data.components && data.components.length > 0) {
        data.components.map(function(comp, i) {
            var _path = path + ".components." + i;
            var component = component_render(comp.name, comp, _path);
            if (Array.isArray(component))
                component.map(c=>container.appendChild(c))
            else
                container.appendChild(component)
        })
    }

    // if (data && data.components && data.components.length > 0) {
    //     data.components.map(function(comp, i) {
    //         var _path = path + ".components." + i;
    //         var component = component_render(comp.name, comp, _path, edition);
    //         console.log(comp.name,component)
    //         // container.appendChild(component);
    //     });
    // }

    if (data && data._ref) {
        file_get_segment(data._ref).then(function(resp) {
            var segment = segment_render(type, resp, path, 0);

            segment.setAttribute("class", className);

            /*if (data.style)
                segment.setAttribute("style", data.style);
*/
            segment.setAttribute("data-ref", data._ref);

            set_attributes(segment, {
                "data-editor": "segment",
                "data-path": path,
                "data-id": pageData.lastid
            });

            container.replaceWith(segment);
            return;
        });
    }

    var parent
    // !!!! despues debe valer para cards y para todo!!!!
    // !!! debe propagarse del padre a los hijos
    if (type || (data && data.type)) parent=container
    else {
        parent = document.createElement("div");
        parent.setAttribute("class", "ui equal width padded grid");
    }

    if (data && data.segments && data.segments.length > 0) {
        data.segments.map(function(seg, i) {
            var segment = segment_render(
                seg.type || (type && "ui"), // !!! Aqui ponía column // Ahora heredamos el tipo de padre, si no lo tiene el hijo para propagar
                seg,
                path + ".segments." + i
            );
            parent.appendChild(segment);
        });
    }

    if (!type && (!data || !data.type)) container.appendChild(parent);

    return container;
}

/*
    Lee un segmento de otra pagina
    Puede estar en la web http://uri#nombre
    O puede estar en la carpeta de
*/

// !!! debería cachearse por si hay varias referencias al mismo segmento
// !!! Como se podrían hacer referencias intra-pagina???
// !!! leer plantillas de otras webs, y de otros realms
// !!! página completa sacada de otro sitio!!! href=idpagina@realm


// !!! marcar como publico/privador el segmento, y no mostrar segmentos privados de otros realm


async function file_get_segment(uri, flushcache = false) {

    // pagina@realm#segmento
    // ?6177a253e0240575dadd7d4a@alcantir#header
    let id = uri.split("#");
    let segmentname = id[1]
    let page = id[0].split("@");
    let realm = page[1] || getRealm()
    let name= page+":"+segmentname + ':'+realm

    if (!file_get_segment.cache) file_get_segment.cache = {};

    if (typeof file_get_segment.cache[name] === "undefined" || flushcache) {
        file_get_segment.cache[name] = fetchJSON(API + realm + "/collections/paginas/" + page?.[0]);

    }

    let segment = await file_get_segment.cache[name];

    if (segment && segment.segments) {
        for (var i = 0; i < segment.segments.length; i++) {
            if (segment.segments[i].name == segmentname)
                return segment.segments[i];
        }
    }

    return {};
}


//PARA CACHER SEGMENTOS DE REFERENCIA
// Y SUSTITUIR file_get_segment

// function memoize (fn) {
//     let cache = {};

//     return async (...args) => {
//         let uri = args[0];
//         let id = uri.split("#");
//         let segmentname = id[1]
//         let page = id[0].split("@");
//         let realm = page[1] || getRealm()
//         let name = page + ":" + segmentname + ':' + realm

//         if (name in cache) {
//             console.log('Fetching from cache');
//             return cache[name];
//         }
//         else {
//             console.log('Calculating result');
//             let result = await fn(segmentname, realm, page);
//             cache[name] = result;
//             return result;
//         }
//     }
// }

// const file_get_segment = memoize(getReferencedSegment)

// async function getReferencedSegment(segmentname, realm, page){
//     let segment = {}
//     const pagePl = await fetchJSON(API + realm + "/collections/paginas/" + page)
//     if(pagePl && pagePl.segments){
//         pagePl.segments.forEach( item => {
//             if(item && item.name && item.name == segmentname){
//                 segment = item
//             }
//         })
//     }

//     return segment;
// }




async function segment_getDependencies(segment) {
    var dependencies = { js: new Set(), css: new Set() };

    function mergeDeps(deps) {
        if (deps && deps.js) {
            deps.js.forEach(dep => dependencies.js.add(dep));
        }
        if (deps && deps.css) {
            deps.css.forEach(dep => dependencies.css.add(dep));
        }
    }

    // se ha pasado un array de segmentos
    if (segment && segment.length) {
        var results = segment.map(async function(seg, n) {
            return await segment_getDependencies(seg)
        });

        if (results) {
            var content = await Promise.all(results);
            content.forEach(mergeDeps)
        }
    } else if (segment && segment.segments && segment.segments.length > 0) {
        var deps = await segment_getDependencies(segment.segments);
        mergeDeps(deps);
        // !!! juntar los results
    }
    if (segment && segment.components && segment.components.length > 0) {
        var results = segment.components.map(async function(comp, n) {
            return component_getDependencies(comp.name);
        });

        if (results) {
            var content = await Promise.all(results);
            content.forEach(mergeDeps);
        }
    }
    return dependencies;
}

// Vuelca en HTML un segmento o un array de segmentos

// !!! debería tener una opción para indicar si se hace render al móvil o a la web
// !!! Intentar evitar pasar si es fila  o columna

// El contexto incluye el estado de las variables de los distintos bucles
// puede pasarse un segmento o un array de segmentos
// ???segmento y array de segmentos son intercambiables en el modelo????

async function segment_toHTML(segment, context = {}, flushcache=false, tables=false) {
    if (!segment)  {
        console.log('Error [No hay datos]:::', segment, context )

            return `<nav>
                    <a class="logo" href="https://digitalvalue.es/">
                        <img src="https://public.digitalvalue.es:8789/alcantir/assets/60618397d56f9f58578a0a1a" alt="dribbble" width="125">
                    </a>
                </nav>
                <main style="font-family: sans-serif;display: flex; flex-direction: column; align-items: center;    height: 90vh; justify-content: center;">
                    <section class="message-404" style="text-align: center;">
                        <h1>¡Ups! Página no encontrada.</h1>
                        <p>Lo sentimos, no hemos podido encotrar la página que buscas</p>
                    </section>
                    <section class="collage-404">
                        <h1 style="font-size: 22vmin; color: #a7a7a7; margin: 16px">404</h1>
                    </section>
                </main>`;
    }

    var _if
    try {
        _if = segment.if ? evaluate(segment.if, context) : null;
    }
    catch (e) {
        console.log("evaluate if",segment.if)
    }
    if (segment.if && _if != "true" && _if != undefined && _if != null && _if != "null") {
        //console.log("Evalua", segment.if, evaluate(segment.if, context), typeof evaluate(segment.if, context))
        return "";
    }
    var html = "";
    var tag = segment.tag || "div"
    var results;

    if (segment._ref) {
        resp = await file_get_segment(segment._ref, flushcache);

        //Si se cambia la clase del segmento _ref sobreescribe clase
        if (segment.className) {
            resp.className = segment.className;
        }
        /*
                if (segment.style) {
                    resp.style = segment.style;
                }*/
        html = await segment_toHTML(resp, context,flushcache,tables);
        return html;
    }

    // se ha pasado un array de segmentos
    if (segment.length) {

        var content = await Promise.all(segment.map( (seg, n) => segment_toHTML(seg, context,flushcache, tables)))
        if (content) {
            if (tables) html+="<table>";
            html += content.join("");
            if (tables) html+="</table>";
        }

        return html;
    }

    /**DATA-ISA. Title, subtitle y lead */
    // if (segment.title) {
    //     html += registeredComponents["dv-simple"].toHTML({
    //         tag: "h1",
    //         value: getLocalized(segment.title, context.lang)
    //     });
    // }
    // if (segment.subtitle) {
    //     html += registeredComponents["dv-simple"].toHTML({
    //         tag: "h2",
    //         value: getLocalized(segment.title, context.lang)
    //     });
    // }
    // if (segment.lead) {
    //     html += registeredComponents["dv-simple"].toHTML({
    //         tag: "h3",
    //         value: getLocalized(segment.title,context.lang)
    //     });
    // }

    var contClass = "";

    if (segment.className) {
        var savedClassName = segment.className.replace(/selected/i, "");
        contClass = savedClassName.trim();
    }

    if (segment && segment.href) tag = "a";

    // Conversión a tablas para email
    if (tables) {
        if (segment && segment.type) {
            if (segment.type==="container" || (segment.class && segment.class.includes("container"))) tag="table"
            if (segment.type==="grid" || (segment.class && segment.class.includes("grid"))) tag="table"
            if (segment.type==="row" || (segment.class && segment.class.includes("row"))) tag="tr"
            if (segment.type==="column" || (segment.class && segment.class.includes("column"))) tag="td"
        }
        //console.log(tag,segment)
    }

    html += `<${tag}`;
    if (contClass.length > 0) {
        html += ` class='${contClass}'`;
    }
    if (segment.id) html += ` id="${segment.id}"`;
    if (segment.title) html += ` title="${segment.title}"`;
    if (segment.dataid) html += ` data-id="${segment.dataid}"`;
    if (segment.style) html += ` style="${segment.style}"`;

    if (segment && segment.href) {
		try {
	        var href=evaluate(segment.href, context);
		}
		catch(e)
		{
			console.log("error en evaluate",e);
		}

	    // Convertir la URL en nombre
	    if (context && context['pages'] && context['pages'][href])
			href=context['pages'][href];
        else
            href = getPath(href)

        html += ` href="${href}" ${segment.target ? 'target="' + segment.target + '"' : ''}`;
        if (segment.target) html += ` target="${segment.target}" `; /// !!! DUPLICADO!!!!
    }

    html += `>`;

    var loop = ['index', 0, 1]; // valor por defecto
    // Si un segmento es un bucle (control de flujo)

    if (segment && segment.for)
        loop = segment.for.split(';');

    if (loop.length<3) alert("error de sintaxis en bucle for")

    // Si hay mas de 3 piezas, la cuarta y siguientes son  variables locales al bucle
    if (loop.length>3)
        console.log("loop",loop[3])

    await dvDatasourceReady;

    ///  Para crear nuevas entradas en el contexto
    if (segment.function ) {
        var f = new Function(segment.function.arguments, segment.function.body)
        f(context)
    }
    
    const max = Number(await evaluate(loop[2], context));
    // evaluamos el for (bucle), para ello cogemos el path del elemento que queremos recorrer
    for (let i = Number(loop[1]); i < max; i++) {
        context[loop[0]] = i;

        // Comprobamos si hay asignaciones de variables locales separadas también por punto y coma
        let n=3
        while (loop[n]) {
            let local=loop[n].split('=')
            // console.log("LOCAL",local)
            // console.log("LOCAL",await evaluate(local[1],context))
            // context[local[0]] = await evaluate(local[1],context) // !!! probando sin parse

            try {
                context[local[0]]=await JSON.parse(evaluate(local[1],context)) // puede ser un objeto complejo
            }
            catch (e) {
                console.log("segmentToHTML",e)
            }

            // console.log("XXXX",local[0],local[1],context[local[0]], context)
            n++
        }

        // !!! Aquí podemos hacer otras evaluaciones para contar con variables mas sencillas para programar el contenido del bucle

        // Primero se analizan los componentes, por lo tanto podemos añadir componentes de codigo
        // que preprocesen los datos
        /**Componentes */
        if (segment.components && segment.components.length > 0) {
            var results = await Promise.all(segment.components.map(function(comp, n) {
                // Añadimos el id del bucle para iteración del componente
                comp.for=i
                return component_toHTML(comp, context);
            }))

            if (results) html += results.join("");
        }

        /**GRID. Segmentos */
        if (segment.segments && segment.segments.length > 0) {
            if (!segment.type || !segment.type) html += `<div class="ui equal width padded grid">`;
            var results = await segment_toHTML(segment.segments, context, flushcache,tables)
            html += results;
            if (!segment.type || !segment.type) html += "</div>";
        }
    }

    html += `</${tag}>`;
    return html;
}


//
//   C O M P O N E N T E S
//

/**Carga componentes.*/

function component_getDependencies(name) {
    if (registeredComponents[name] && typeof registeredComponents[name].dependencies === "function") {
        return registeredComponents[name].dependencies();
    } else {
        return {};
    }
}

function component_render(name, data, path = "", edition = 1) {
    let context=pageData.context || {}
    if (registeredComponents[name] && registeredComponents[name].render)
        return registeredComponents[name].render(data, path, context, edition)
    else if (name === "style") //El componente es una etiqueta style
        return renderComponent("style", name, data, path, edition)
    else return renderComponent("div", name, data, path, edition)
}

// renderiza los atributos base de cualquier componente
// !!!!¿Es necesario que los componentes tengan los mismos atributos que el segmento???

function renderComponent(tag, name, data, path, edition = 1) {
    var component = document.createElement(tag);
    pageData.lastid++;
    if (edition) {
        set_attributes(component, {
            "data-path": path || "",
            "data-editor": "component",
            "data-component": name,
            "contenteditable": true
        });
    }
    if (!data) return component;

    if (data.dataid)
        component.setAttribute("data-id", data.dataid);
    else
        component.setAttribute("data-id", pageData.lastid);

    if (data.href) component.setAttribute("href", getPath(data.href));
    if (data.target) component.setAttribute("target", data.target);
    if (data.id) component.setAttribute("id", data.id);
    if (data.if) component.setAttribute("data-if", data.if);
    if (data.src) component.setAttribute("src", data.src);
    if (data.style) component.setAttribute("style", data.style);
    if (data.className) component.setAttribute("class", data.className);
    if (data.controls) component.setAttribute("controls", data.controls);
    if (data.alt) component.setAttribute("alt", data.alt);
    if (data.title) component.setAttribute("title", data.title);
    if (data.for) component.setAttribute("for", data.for);
    if (data.poster) component.setAttribute("poster", data.poster);
    if (data.onclick) component.setAttribute("onclick", data.onclick);
    if (data.emitter) component.setAttribute("data-emitter", data.emitter);
    if (data.consumer) component.setAttribute("data-consumer", data.consumer);
    if (data.onmoueseover) component.setAttribute("onmoueseover", data.onmoueseover);
    if (data.onmouseout) component.setAttribute("onmouseout", data.onmouseout);
    if (data.width) component.setAttribute("width", data.width);
    if (data.height) component.setAttribute("height", data.height);
    if (data.frameborder) component.setAttribute("frameborder", data.frameborder);
    if (data.allowfullscreen) component.setAttribute("allowfullscreen", data.allowfullscreen);
    if (data.value) component.innerHTML = data.value;
    if (data.localized) component.setAttribute("data-localized", data.localized);
    if (data.json) component.setAttribute("data-json", data.json);

/*
    if (data && data.components && data.components.length > 0) {
        data.components.map(function(comp, i) {
            var _path = path + ".components." + i;
            var child = component_render(comp.name, comp, _path, edition);
            component.appendChild(child);
        });
    }
*/

    return component;
}

/**
 *   Componentes de la página
 *
 */

function component_toJson(nodo) {
    if (nodo.tagName === "STYLE")
        return {
            name: "style",
            value: nodo.innerHTML
        }

    var name =
        nodo.getAttribute("data-component") ||
        nodo.getAttribute("data-name") ||
        nodo.localName ||
        "";

    var component = {
        name: name,
        type: "component"
    };

    if (nodo.className) {
        var savedClassName = nodo.className.replace(/selected/i, "");
        component.className = savedClassName.trim();
    }

    if (nodo.hasAttribute("id")) component["id"] = nodo.getAttribute("id");
    if (nodo.hasAttribute("data-id")) component["dataid"] = nodo.getAttribute("data-id");
    if (nodo.hasAttribute("style")) component.style = nodo.getAttribute("style").replaceAll(/url\(\"(.+)\"\)/g, "url($1)")
    if (nodo.hasAttribute("href")) component.href = nodo.getAttribute("href");
    if (nodo.hasAttribute("target")) component.target = nodo.getAttribute("target");
    if (nodo.hasAttribute("alt")) component.alt = nodo.getAttribute("alt");
    if (nodo.hasAttribute("title")) component.title = nodo.getAttribute("title");
    if (nodo.hasAttribute("onclick")) component.onclick = nodo.getAttribute("onclick");
    if (nodo.hasAttribute("onmoueseover")) component.onmoueseover = nodo.getAttribute("onmoueseover");
    if (nodo.hasAttribute("onmouseout")) component.onmouseout = nodo.getAttribute("onmouseout");

    if (nodo.hasAttribute("data-if")) component["if"] = nodo.getAttribute("data-if");
    if (nodo.hasAttribute("data-emitter")) component.emitter = nodo.getAttribute("data-emitter");
    if (nodo.hasAttribute("data-consumer")) component.consumer = nodo.getAttribute("data-consumer");
    if (nodo.hasAttribute("data-localized")) component.localized = nodo.getAttribute("data-localized");

/*
    //!!!! revisar y completar
    // Para pintar componentes internos. Ha de exigirse que tenga tipo
    if (nodo.hasChildNodes()) {
		component.components = [];
		for (var j = 0; j < nodo.children.length; j++)
	        component.components[j] = component_toJson(nodo.children[j]);
	}
*/
    // Añadimos los atributos comunes a los específicos del componente
    if (registeredComponents[name] && registeredComponents[name].toJson)
        return Object.assign(component, registeredComponents[name].toJson(nodo));
	else // Copiamos el contenido. ¿queremos que se pueda pasar innerhtml en todos los componentes?
		if (nodo.innerHTML) component.value = nodo.innerHTML;
	// !!! si no está definido el componente deberíamos dar un error?????
    return component;
}


// context contiene el contexto de evaluación de la expresión
// y contiene params y query que se han pasado en la URL
// y cada uno de los datasources definidos
/*
{
	params: [],
	query: {},
	datasource1: {},
	datasource2: {},
	i : scalar
}

y permite evaluar expresiones

/url/param1/param2/?arg1=1&arg2=2

params[1]=param1
query.arg2=2
datasource1.items[2].xxxx

//!!! hack. Valorar posibles inseguridades de esta aproximacion.

slots define los valores por defecto, y se configuran en el datasource
*/

function evaluate(expr, context = {},slots={}) {
    //if(Object.keys(context).length === 0) return expr
    // console.log("evaluate expr", expr)
    // console.log("evaluate context", context)
    // console.log("evaluate slots", slots)

    //Creamos las variables de contexto para poder evaluar la expresión
    // Comprobamos???? if (typeof data[key] === 'string' && /\$\{.+\}/.test(data[key]))

    for (var key in context) {
        if (!['params', 'query'].includes(key)) {
            try {
                // console.log(key,typeof context[key],context[key])
                // if (typeof context[key] === "object")
                eval("var " + key + "= " + JSON.stringify(context[key]) + ";");
                // else eval(`var ${key} = ${context[key]};`);
            } catch (e) {
                if (e instanceof SyntaxError) {
                    console.log("evaluate:" + key + ":" + context[key], e.message);
                }
            }
        }
    }

    // Las var se definen para el contexto superior
    if (context['params'])
        var params = context['params'];

    else if (slots.params)
        var params = slots.params;     // utilizamos el definido en slots en datasource

    if (context['query'])
        var query = context['query'];
    else if (slots.query)
        var query = slots.query;     // utilizamos el definido en slots en datasource

// !!!! ¿por que cuando es un objeto el resultado hay que stringificarlo???
    try {
        let result=eval("`" + expr + "`")
        // console.log("EXPRE",expr,result)
        return result
    } catch (e) {
        // console.log(e);
        // console.error(expr);
        if (typeof pageData!== "undefined" && pageData.errors) pageData.errors.push({err:String(e),expr:expr})
        //si no puede evaluar que devuelve la expresión ????
        // return expr
        return ""
    }
}

async function component_toHTML(comp, context={}) {

/*
// Aqui debería renderizar los componentes compuestos
// !!! en que punto hay que incluir el HTML de los hijos????
    if (comp && data.components && data.components.length > 0) {
        data.components.map(function(comp, i) {
            var _path = path + ".components." + i;
            var child = component_toHTML(comp.name, context);
            component.appendChild(child);
        });
    }

    for (let i = loop[1]; i < max; i++) {
        context[loop[0]] = i;

        //Componentes
        if (segment.components && segment.components.length > 0) {
            var results = segment.components.map(function(comp, n) {
                return component_toHTML(comp, context);
            });

            if (results) {
                var content = await Promise.all(results);
                html += content.join("");
            }
        }
    }
*/


  if (
	comp.name &&
      registeredComponents[comp.name])
	{
        //console.log(comp)
		if ( registeredComponents[comp.name].toHTML) {
		    if (comp.consumer) {
		        const consumers = JSON.parse(comp.consumer.replace(/\n/g, " "));
                console.log('consumers', consumers)
		        const script = consumers.map(consumer => `<script>
		            consumeEvent('${consumer.emitter}',
		                        ${consumer.consumer},
		                        ${comp.id ? `document.getElementById('${comp.id}')` : `getTargetConsumer(document.currentScript)`})
		        </script>`).join("\n");

                try {
                    var html = await registeredComponents[comp.name].toHTML(comp, context);
                    return html + "\n" + script;
                }
                catch (e) {
                    console.log(comp.name,e)
                    return "\n";
                }
		    }

			try {
			    return registeredComponents[comp.name].toHTML(comp, context);
			}
			catch(e)
			{
				console.log(`error ${comp.name}.toHTML`,e);
				return `[[[ERROR ${comp.name}]]]`;
			}
    	}
		else
		{
			try {
				console.log("dv-simple");
			    return registeredComponents['dv-simple'].toHTML(comp, context);
			}
			catch(e)
			{
				console.log(`error dv-simple.toHTML`,e);
				return "[[[ERROR]]]";
			}
		}
	}
    else if (comp.name === "style") {
        if (comp.value) {
            return `<style>${comp.value}</style>`;
        }
    }
    else
        return `NO EXISTE EL COMPONENTE ${comp.name}`;

}

function getDependencies(dependencies) {
    var scriptDeps = [];
    var styleDeps = [];
    if (dependencies && dependencies.js)
        dependencies.js.forEach(src => scriptDeps.push(`<script src="${src}"></script>`));
    if (dependencies && dependencies.css)
        dependencies.css.forEach(src => styleDeps.push(`<link rel="stylesheet" href="${src}">`));
    return {
        css: styleDeps.join("\n"),
        js: scriptDeps.join("\n")
    }
}

//
// P A G E
//

var dvDatasourceReady = Promise.resolve();

async function page_toHTML(page, realm, context,flushcache=false) {

    if(page.err){

        /// !!! Cachear!!!
        console.error('Page not found', page);
        const page404 =  await fetchJSON(API + realm + "/collections/paginas?name='404'");

        if(page404 && page404.items ) 
            page = page404.items[0]
        else return `<nav>
                    <a class="logo" href="https://digitalvalue.es/">
                        <img src="https://public.digitalvalue.es:8789/alcantir/assets/60618397d56f9f58578a0a1a" alt="dribbble" width="125">
                    </a>
                </nav>
                <main style="font-family: sans-serif;display: flex; flex-direction: column; align-items: center;    height: 90vh; justify-content: center;">
                    <section class="message-404" style="text-align: center;">
                        <h1>¡Ups! Página no encontrada.</h1>
                        <p>Lo sentimos, no hemos podido encotrar la página que buscas</p>
                    </section>
                    <section class="collage-404">
                        <h1 style="font-size: 22vmin; color: #a7a7a7;    margin: 16px">404</h1>
                    </section>
                </main>`

    }

    function getDataSource(datasource) {

        let options = datasource.options || undefined;

        return fetchJSON(evaluate(datasource.url, context, datasource.slots), options)
        .then(function (data) {

            /// Aquí sería interesante aplicar alguna transformación
            /// * cambiar nombres de las variables
            /// * Aplicar operaciones y crear campos calculados
            /// * * * * * 
            // {"function":{"arguments":"a,b,c","body":"return a*b+c;"}}

            if (datasource.function ) {
                let f

                if (typeof datasource.function === "string")
                    f = new Function("data", "return JSON.stringify(data.items)")
                    // f = new Function("data", datasource.function)
                else
                    f = new Function(datasource.function.arguments, datasource.function.body)

                console.log(datasource.name,f)

                context[datasource.name] = f(data)

                console.log(datasource.name,f,context[datasource.name])
            }

            else {
                context[datasource.name] = data
                // Si no se evalua y existe default aplicar
                if (datasource.edition && data.items && data.items[0]) {
                    if (!context.edition) context.edition=[]
                    /// !!! esto para que se utiliza??????
                    const savedInContext = context.edition.some( el => el.id === data.items[0]._id);
                    if(!savedInContext)
                        context.edition.push({collection:datasource.edition,id:data.items[0]._id})
                }
            }
        })
    }
    
    if (page.datasources) {
        console.log(page.datasources)
        //!!! aplicar parámetros. Como evaluamos los campos???
        let sources = [];
        let json = JSON.parse(page.datasources);

        // Ordenamos por prioridad y lo pasamos en secuencia definida
        let index = {}
        json.forEach(d=>{ if (typeof d.priority!=="undefined" && !index[d.priority]) index[d.priority]=true})
        let priorities= Object.keys(index).sort()

        console.log(priorities)

        for(priority in priorities) {
            console.log(priority)
            await Promise.all(json.filter(d=>d.priority===priority).map(datasource=>getDataSource(datasource)))
        }

        /// Ahora hacemos los que no tienen prioridad

        dvDatasourceReady =  Promise.all(json.filter(d=>typeof d.priority==="undefined").map(datasource=>getDataSource(datasource)))

        // sources = json.map(datasource => {

        //     let options = datasource.options || undefined;

        //     return fetchJSON(evaluate(datasource.url, context, datasource.slots), options)
        //         .then(function (data) {

        //             if (datasource.function ) {
        //                 var f = new Function(datasource.function.arguments, datasource.function.body)
        //                 context[datasource.name] = f(data)
        //             }

        //             else {
        //                 context[datasource.name] = data
        //                 // Si no se evalua y existe default aplicar
        //                 if (datasource.edition && data.items && data.items[0]) {
        //                     if (!context.edition) context.edition=[]
        //                     /// !!! esto para que se utiliza??????
        //                     const savedInContext = context.edition.some( el => el.id === data.items[0]._id);
        //                     if(!savedInContext)
        //                         context.edition.push({collection:datasource.edition,id:data.items[0]._id})
        //                 }
        //             }
        //         });
        // });

        // dvDatasourceReady = Promise.all(sources);
    }


    // leemos las páginas para hacer la conversión de url
    //!!!cuidado, esto puede relentizar mucho
    pages = await readPages(realm);

    context['pages'] = pages || []; // lo guardamos para utilizarlo en los tohtml de los componentes

    // emparejar productores y consumidores !!!!????

    let locale = context.lang;

    let webDependencies,
        general_css = "",
        general_js = "",
        favicon = "",
        specific_css = page.style || "",
        pageDependencies;

        console.log("QUI",realm)
    console.log("QUI",realm)
    console.log("QUI",realm)
        console.log("QUI",realm)
    console.log(realm,"==",page.web,"==",getRealm())
    let webconf = page.web && page.web != "" ? await getWebData(realm,page.web,flushcache) : {}
    //var webconf = await fetchJSON("https://api.digitalvalue.es/" + getRealm() + "/collections/webs/?web=" + page.web);

    if (!webconf || Object.keys(webconf).length===0) console.log("webconf VACIO")

    if (Object.entries(webconf).length > 0) {
        general_css = webconf.style || "";
        general_js = webconf.script || "";
        favicon = `<link rel="icon" href="${webconf.favicon}" />` || "";
       // console.log("asd: ", webconf.dependencies,  webconf.dependencies.length)
        // webDependencies = webconf.dependencies && webconf.dependencies.length ? await getDependencies(webconf.dependencies.filter(f=>f.indexOf('mithril')!==-1), false) : {css:"",js:""};

        if(webconf.dependencies && Object.entries(webconf.dependencies).length > 0){
            // if(Array.isArray(webconf.dependencies.js) && webconf.dependencies.js.length > 0){
            //     // !!! da problemas en el servidor
            // //    const filteredDependenciesJs = webconf.dependencies.js.filter(f=> f.indexOf('mithril') == -1)
            // //    webconf.dependencies.js = filteredDependenciesJs
            // }
           webDependencies = getDependencies(webconf.dependencies)
        }else
            webDependencies = {css: [], js: []}

    }
    else if (page.favicon && page.favicon.length > 0)
        favicon = `<link rel="icon" href="${page.favicon}" />`;

    let dependencies = await segment_getDependencies(page.segments);
    let segmentDependencies = getDependencies(dependencies)

    /// !!!! Filtrar los repetidos?????

    if( page.dependencies && Object.entries(page.dependencies).length > 0){
        // if(Array.isArray(page.dependencies.js) && page.dependencies.js.length > 0){
        //     const filteredPageDependenciesJS = page.dependencies.js.filter(f=> f.indexOf('mithril') == -1)
        //     page.dependencies.js = filteredPageDependenciesJS
        // }
        pageDependencies = getDependencies(page.dependencies)
    }else
        pageDependencies = {css: [],js: []}

    // var pageDependencies = page.dependencies && page.dependencies.length ? await getDependencies(page.dependencies.filter(f=>f.indexOf('mithril')!==-1), false) : {css:"",js:""};

    let content = await segment_toHTML(page.segments, context,flushcache);
    // var content = await segment_toHTML(page.segments, context, true); /// generar para tablas


    let title = page.title || "Titulo de la pagina";
    if (page["user-scripts"]) {
        content += `<script>${page["user-scripts"]};</script>`;
    }

    /// !!!! SI es desarrollo es ${WEB}/
    // !!!!! Si es producción es ./

    let root=WEB
    // let root="."

    //Falta añadir descripcción en formulario de pagina.
    let metaDescription = page.description || title;

    //Falta añadir descripcción en formulario de pagina.
    let metaKeywords = page.keywords || "";

    // ${dependencies && dependencies.css ? dependencies.css : ''}
    // ${dependencies && dependencies.js ? dependencies.js : ''}

    let html = `
    <!DOCTYPE html>
    <html lang="es">
        <head>
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta name="description" content="${metaDescription}">
            <meta name="keywords" content="${metaKeywords}">
            <title>${title}</title>
            ${favicon}
            <link rel="stylesheet" href="${root}/dist/semantic/semantic.min.css">
            ${pageDependencies && pageDependencies.css ? pageDependencies.css : ''}
            ${webDependencies && webDependencies.css ? webDependencies.css : ''}
            ${segmentDependencies && segmentDependencies.css ? segmentDependencies.css : ''}
            <script src="${root}/dist/jquery-3.4.1.min.js"></script>
            <script src="${root}/dist/semantic/semantic.min.js"></script>
            ${webDependencies && webDependencies.js ? webDependencies.js : ''}
            ${pageDependencies && pageDependencies.js ? pageDependencies.js : ''}
            ${segmentDependencies && segmentDependencies.js ? segmentDependencies.js : ''}

            <script>
                //const locale = '${locale}';
                function emitEvent(element, name, args) {
                    var event = new CustomEvent("c-" + name, { detail: args || [] });
                    element.dispatchEvent(event);
                }
                function getTargetConsumer(script) {
                    var consumer = script.parentElement.querySelector('[data-consumer]');
                    if (!consumer) {
                        function findNotScript(element) {
                            var prev = element.previousElementSibling;
                            return prev.tagName !== 'SCRIPT'?prev:findNotScript(prev);
                        }
                        consumer = findNotScript(script);
                    }
                    return consumer;
                }
                function consumeEvent(emitter, callback, target) {
                    document.addEventListener('DOMContentLoaded',function() {
                        var separator = emitter.indexOf('.');
                        var parts = [emitter.slice(0,separator),emitter.slice(separator+1)];
                        document.querySelector(\`[data-emitter='\${parts[0]}']\`).addEventListener("c-" + parts[1], function (event) { callback.apply(target || window, event.detail) })
                    })
                }
            var context = ${JSON.stringify(context)}
            const openRequest = window.indexedDB.open("notes_db", 1);
            ${general_js}
            </script>
            <script>
            // Para comunicación en entorno multiventana de ZiTY
            // Añadimos un controlador de mensajes para poder enviar comandos a las ventanas
            window.addEventListener('message', event => {
                    console.log("MESSAGE",event)
                    if (event.origin.startsWith('https://public.digitalvalue.es')) {
                        if (event.data.zoom) window.document.body.zoom=event.data.zoom
                       // console.log("EVENT");
                    } else return;
                });
            </script>
            
            <!-- Global style -->
            <style>
                ${general_css}
            </style>

            <!-- Specific page style -->
            <style>
                ${specific_css}
            </style>
    `;

    //         <body id='main' class='ui grid container'>

    html += `
        </head>
        <body id='main'>
        ${content}
        </body>
    </html>
    `;

    return html;
}

function getLocalized(item, locale = null) {
    if (typeof item === 'string')
        return item
    if (!locale)
        locale = getLocale() // Esto solo valdrá en el cliente

    if (locale === 'va' && !item[locale]) locale = 'ca'
    else if (locale === 'ca' && !item[locale]) locale = 'va'

    if (typeof item === 'object') {
        let resp = item[locale] || item.und || item.es || item.va || item.ca || item[0] || '';

        return resp
    }
}
function getRealm(realm) {

   // console.log('getRealm')
    // if (pageData && pageData.context && pageData.context.realm) return pageData.context.realm // Para pruebas
    if (realm) {
		this.realm = realm;
		// Cuando se ejecuta en el cliente, a traves del localstorage se pasa al filemgr (dv-zity-asset-manager)
        if (typeof localStorage !== "undefined")
            localStorage.setItem('realm',realm);
	}
    if (!this.realm) return undefined;
    else return this.realm;
}

function localizeFileUri(file, realm=getRealm(), collection) {

    if (!file) return

    //console.log("localizeFileUri",file)

    const base = "https://cdn.digitalvalue.es"  /// SE debería leer de config !!!!
    /// Si la web tiene configuración de api /xxxx/api/contents

    let _collection
    if (collection && !["articulos", "entidades"].includes(collection)) 
        _collection = collection

    if (typeof file === 'string')
        return `${base}${realm ? "/" + realm : ''}${_collection ? "/" + _collection : ''}/assets2/${file}`

    // if (typeof file === 'string') 
    //     return `${base}${realm ? "/" + realm : ''}/assets/${file}`  /// Modelo antiguo

    if (file.collection)
        _collection = file.collection

    if (file.file)
        return `${base}/${realm}${_collection ? "/" + _collection : ''}/assets2/${file.file}`

    if (file._id)
        return `${base}/${realm}${_collection ? "/" + _collection : ''}/assets2/${file._id}`

    if (file.uri)
        return localize(file.uri)

    if (file.href)
        return localize(file.href)

    return resp
}


// resuelve las URL para distintos tipos de datos imagen de ZiTY
function getImage(image, realm, collection=null) {

    return localizeFileUri(image, realm, collection) // Por defecto collección fs

}

// function getImage(image,collection=null) {
//     if (typeof image === "object") {
//         if (image.uri) return getLocalized(image.uri)
//     }
//     else if (typeof image === "string") {
//         /// !!! Cambia a URL de producción cuando la tengamos
//         return `https://public.digitalvalue.es:8789/${getRealm()}/${collection?collection+'/':''}assets/${image}`
//     }
//     else return "MODELO DE IMAGEN DESCONOCIDO"
// }

// El idioma en el servidor no puede ser el mismo para todos.
// Hay que personalizarlo para cada sesión, y por lo tanto debería
// venir fijado del cliente
// Esta funcion es adecuada para el render, en modo de diseño, pero no para toHTML en producción

function getLocale(locale) {

    // Cambiar el idioma
    if (locale) {
        getLocale.locale = locale;
        if (typeof localStorage !== "undefined") localStorage.lang = locale
    }

    // Consulta
    else if (!getLocale.locale)
        if (typeof localStorage !== "undefined" && localStorage.lang) getLocale.locale = localStorage.lang
        else getLocale.locale = "und"; // definir idioma por defecto
        // else getLocale.locale = "es"; // definir idioma por defecto

    return getLocale.locale;
}

function getPath(path) {
    /// !!! Si path es absoluto https://xxxx => No hace nada
    /// También se podría utilizar un caso especial si path no empieza con /
    
    if (path.startsWith('http')) return path

    // La diferencia es si se está en app o en app80
    // if (typeof process!=="undefined" && process.env['HOSTNAME']==="xbrl_panel")  // Solo en desarrollo (zitybuilder) se añade el realm

    // console.log("development",development,typeof development !== "undefined" && development)

    if (typeof development !== "undefined" && development)  // Solo en desarrollo (zitybuilder) se añade el realm
        return `/${getRealm()}${Array.from(path)[0]==='/'?'':'/'}${path}` /// caminos absolutos 
    return path
}

function getFechaTexto(date) {
    if (!date) return ""
    const day = [
        {va: "Diumenge", es: "Domingo"},
        {va: "Dilluns", es:"Lunes"},
        {va: "Dimarts", es:"Martes"},
        {va: "Dimecres", es:"Miércoles"},
        {va: "Dijous", es:"Jueves"},
        {va: "Divendres", es:"Viernes"},
        {va: "Dissabte", es:"Sábado"}
    ]
    const month = [
        {va: "Gener", es: "Enero"},
        {va: "Febrer", es:"Febrero"},
        {va: "Març", es:"Marzo"},
        {va: "Abril", es:"Abril"},
        {va: "Maig", es:"Mayo"},
        {va: "Juny", es:"Junio"},
        {va: "Juliol", es:"Julio"},
        {va: "Agost", es:"Agosto"},
        {va: "Septembre", es:"Septiembre"},
        {va: "Octobre", es:"Octubre"},
        {va: "Novembre", es:"Noviembre"},
        {va: "Dicembre", es:"Diciembre"}
    ]
    const today = new Date(date);
    const dayToString = getLocalized(day[today.getDay()]);
    const monthToString = getLocalized(month[today.getMonth()])
    return dayToString + ", " + today.getDate() + " de " + monthToString + " de " + today.getFullYear();
}

// pasar flushcache
async function getWebData(realm,web = '',flushcache=false) {

    if (!getWebData.cache) getWebData.cache={}
    if (!getWebData.cache[realm]) getWebData.cache[realm]={}
    if (!getWebData.cache[realm][web] || flushcache) {
        /// !!!! este bloque hay que protegerlo contra entradas simultaneas
        let conf=await fetchJSON(API + realm + "/collections/webs?web=" + web);
        if (conf?.items?.[0])
            getWebData.cache[realm][web]=conf.items[0]
    }

    return getWebData.cache[realm][web]

//    var _webData = await fetchJSON(API + getRealm() + "/collections/webs/filter/?web=" + web);
    // return (_webData && _webData.items && _webData.items.length > 0 && _webData.items[0]) ? _webData.items[0] : {};

}

//cache: "no-cache"
async function fetchJSON(url, options = {}) {
    if(!url) return
    //console.log('uri: ', url, options)
    return fetch(encodeURI(url), options)
        .then(response => {
            if (response.ok) {
                return response.json();
              }
            console.log("ERROR fetchJSON",response)
            // throw new Error('fetchJSON:');
        })
        .catch(error => {
            console.log("fetchJSON")
            console.error(error);
        });
}


async function doAjax(ajaxurl, method = "GET", dataType = "json", data = null, credentials = true) {
    let result;

//!!! esto habrá que comprobar el tipo de dato sino es json
    try {
        return fetch(ajaxurl,{
                credentials: 'include',
                method: method,
                headers: {
                    "Content-type": 'application/json',
                },
                body: data ? JSON.stringify(data) : data
        })
        .then(res=>res.json())
        .then(json=>{
            console.log(ajaxurl)
            return json
        })

        // result = await $.ajax({
        //     url: ajaxurl,
        //     xhrFields: {
        //         withCredentials: credentials
        //     },
        //     method: method,
        //     contentType: 'application/json',
        //     dataType: dataType,
        //     data: data ? JSON.stringify(data) : data
        // });
    } catch (error) {
        return console.log("ERROR:", error,ajaxurl,method);
    }
}

// ??? esto que hace????
function isJson(item) {
    item = typeof item !== "string" ?
        JSON.stringify(item) :
        item;

    try {
        item = JSON.parse(item);
    } catch (e) {
        return false;
    }

    if (typeof item === "object" && item !== null) {
        return true;
    }

    return false;
}

// Para las URL limpias

function normalizar(s) {
	var s1 = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç ";
	var s2 = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc_";
	for (var i = 0; i < s1.length; i++) s = s.replace(new RegExp(s1.charAt(i), 'g'), s2.charAt(i));

    // los caracteres especiales
    s = s.replace(/\?/g, '_');
    s = s.replace(/\//g, '_');
	return s;
}

//!!!! si hay dos referencias a la misma página se cargará dos veces. QUizas en el node solo la primera vez.

/// !!! No se utiliza??
async function pageName(id)
{
	const api=getApi();
	const realm=getRealm();

	if (typeof pageName.cache === "undefined")
		pageName.cache = [];

	if (pageName.cache[id])
		return pageName.cache[id];

	pageName.cache[id] = await fetch(`${api}${realm}/collections/paginas/?_id=${id}&fields=name`)
			.then(response => response.json())
			.then(json => {
					if (typeof (json.items[0]['name']) !== "undefined")
						return normalizar( json.items[0]['name'] ); // quitamos los espacios
			})
			.catch(error => {
				console.error("pageName",error);
			});

	return pageName.cache[id];
}

// Lee todas las páginas y crea el mapa de urls limpias
// !!! esto hay que cachearlo para que no se llame constantemente !!!!!!
// Separar por realm

async function readPages(realm,force=false)
{
	const api=getApi();

	if (typeof readPages.cache === "undefined")
		readPages.cache = [];

	if (!force && typeof readPages.cache[realm] !== "undefined")
		return readPages.cache[realm];

	var data =  await fetch(`${api}${realm}/collections/paginas?fields=name&limit=500`)
			.then(response => response.json()
				.then(json => {
                    return json;
			}))
			.catch(error => {
				console.error("readPages",error);
			});

    var pages={};
    if (data && Array.isArray(data.items))  {
        for (var i = 0; i < data.items.length; i++)
        if (data.items[i]['name']) pages[ data.items[i]['_id'] ] = normalizar( data.items[i]['name'] );
    	readPages.cache[realm]=pages;
    }
    return pages;
}

//Funciones para manjer campos del componente

// wrapper de la función evaluate
function evaluaJSON(data, context) {
    try {
        if (typeof data === 'string' && /\$\{.+\}/.test(data))
            return JSON.parse(evaluate(data, context))
        else
            return data
    }
    catch (e) {
        return {}
    }
}

function selectHandler(id, attr) {
    let select = document.getElementById(id);
    select.parentNode.dataset[attr] = select.value
}
function inputHandler(id, key, dataid){
    // console.log(id, key, dataid)
    let value = document.getElementById(id).value;
    let component = document.querySelector(`[data-id='${dataid}']`);

    if(key === 'style'){
        component.style = value
    }else if(key === 'className'){
        component.className = value;
    }else if(key === 'id'){
        component.id = value;
    }else{
        component.dataset[key] = value;
    }
}

function componentRenderView( component = null) {
    if( !component ) return;
    const fields = component.data ? fieldsComponent(component.data) : '';
    const title = component.title ? component.title : '';
    const info = component.info ? infoComponent(component.info) : '';
    return `<div class="ui top attached inverted huge header" style="position: relative">
                ${title}
                <button class="ui circular button hidden selected:visible" onclick="$(this).next().toggle()" style="padding:10px;float:right;margin-top: -7px;">
                    <i class="info icon" style="margin: 0;"></i>
                </button>
                ${info}
            </div>
        <div class="ui attached segment">${fields}</div>`;
}

function infoComponent(info) {
    let html = `
    <div class="helper" style="display:none;position:absolute;z-index: 100;left: 0px; right: 0px; top: 100%;box-shadow: rgb(0 0 0 / 30%) 0px 0px 9px 0px;">
        <div class="ui small header ignored info message">
            <i class="info small icon"></i>
            <div class="content">
                ${info}
            </div>
        </div>
    </div>` ;
    return html;
}

function fieldsComponent(data){
    let html = '';
    for (let key in data) {
        if(key !== 'name' &&
            key !== 'type' &&
            key !== 'dataid' &&
            key !== 'for' &&
            key !== 'if' &&
            key !== 'config'){

            let id = `id-${key}-${data.dataid}`;
            html += `<div class="component-field" style="margin-bottom: 10px;display:flex;flex-direction:row;align-items: center;">
                    <label for="${key}" style="font-weight: 600;">${key}</label>`;
            if(data.config && data.config[key]){
                html += selectInput({
                    id: id,
                    key: key,
                    dataid: data.dataid,
                    value: data[key],
                    options: data.config[key].options
                })
            }else{
                html += textInput({
                    id: id,
                    key: key,
                    dataid: data.dataid,
                    value: data[key]
                })
            }
            html += '</div>'
        }
    }

    return  html;

    function textInput(item){
        return `<input class="ui input" oninput="inputHandler('${item.id}', '${item.key}', '${item.dataid}')" id="${item.id}" value="${item.value}" type="text" style="border: 1px solid #ccc; padding: 5px;width: 100%;margin-left: 5px;">`;
    }

    function selectInput(config){
        const { id, key, dataid, value, options} = config;
        let html = '';
        options.map( item => {
            html += option(item)
        })

        return `<select id="${id}" class="ui select" onchange="inputHandler('${id}', '${key}', '${dataid}')" style="margin-left: 1rem;padding: 4px 10px;border-radius: 4px;">${html}</select>`;

        function option(item){
            let selected = '';
            if(item === value)
                selected = 'selected'
            return `<option value="${item}" ${selected}>${item}</option>`
        }
    }
}

function getUniqueId(len = 5) {
    return Math.random().toString(36).substr(2, len)
}
