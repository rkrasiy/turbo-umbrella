
import { MenuCollapsible } from "./components-m/menu-collapsible.js"
import { Modal, localize,api_get, SvgIcon, Icon, APICONTENTS } from '../../components/util.js'
import { ColorPicker, Tree, Dialog, TextEditor, PanelLateral, Panel } from '../../components/visuals.js'
import { Checkbox, Input, Select } from '../../components/forms.js'
import { OpenAssetsManager } from "../../components/documentos.js"
import { EditorCodeMirror } from './../../components/codemirror/codemirror.js'
import { Page } from '../../components/util.js'
import { Collaboration } from '../../components/collaboration.js'
import { CkEditor } from "../../components/ckeditor/index.js"

//Estas lineas de codigo producen que pageData.segments  = []

// let mainEl = document.getElementById('main')
// let domChange = () => pageData.segments = segment_toJson(mainEl.children)
// let observer = new MutationObserver(domChange)
// observer.observe(mainEl, { attributes: true, childList: true })

let control = {
    menucollapsible: false,
    menucollapsibleEditor: false
}

// !!! cambiar por el login.js para poder incorporar esto
//
// let params = (new URL(document.location)).searchParams
// let realm = params.get("realm")
// if (realm) User.setAuthRealm(realm)

async function login() {
    doAjax(APIUSER + "loggedin").then(function(result) {
        if (typeof result === 'undefined' || result.status) {
            $('.ui.modal.loginBox').modal('show');
            dvAuth('loginBox', {
                locale: 'es',
                isLoginWithToken: false,
                theme: {
                    color: 'red'
                },
                onAuthenticated: function(user) {
                    $('.ui.modal.loginBox').modal('hide');
                    logged(user);
                    // Asignamos el valor de Page.realm para compatibilidad con componentes-m
                    console.log(Page)
                },
                onAuthError: function(error) {
                    console.log('error', error);
                }
            });
        } else {
            logged(result);
            Page.realm=getRealm()
        }
    });
}

function cargarPlantilla(name) {
    newPage(name);
    $('#leftMenuPlantillas').slideToggle();
}


function addElement(name, tag, text, attrs, children=[]) {
    //console.log("addElement", name, tag, text, attrs)
    //activeSavePageButton()
    let data = {}
    if (attrs)
        data = attrs
    else {
        let dvcomponent = getComponent(name)
        data = dvcomponent.new(tag || "", text)
    }

    var element = component_render(name, data)

    if (typeof attrs === "object")
        Object.keys(attrs).forEach(a=>{
            element.setAttribute(a,attrs[a])
        })

    $(selectedItem).append(element);
    highlightElement(element)
    return element
}


// Crea el menú para añadir nuevos componentes de los componentes definidos por el usuario
function componentExtra() {
    let extra = "";

    for (var name in registeredComponents) {
        if (registeredComponents[name])
		{
			extra +=`
					<div class="item">
						<a title="<button> Añadir botón" onclick="addElement('${name}', 'button', '');">
						    <i class="square outline blue icon"></i>
						    <span class="text">${name}</span>
						</a>
					</div>
			`;
		}
    }
    return extra;
}

function componentMenu() {
    const name = selectedItem.getAttribute("data-component")
    let menu = "";
    // for (var name in registeredComponents) {
    //     if (registeredComponents[name].menu)
    //         menu += registeredComponents[name].menu();
    // }
    // return menu;
    //console.log(name)
    if(registeredComponents[name] && registeredComponents[name].menu)
        menu = registeredComponents[name].menu(selectedItem)
    return menu
}

function DraggableDialog() {
    let modal = false,
        move = false,
        el;
    // !!! el problema es que se hace muy grande, pero no se amplia porque no cabe
    function drag(e) {
        const dx = el.offsetLeft + e.movementX;
        const dy = el.offsetTop + e.movementY;

        el.style.left =  dx + "px";
        el.style.top = dy + "px";
    }

    function stop(e) {
        move = false
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stop);
    }
    
    return {
        view:(vnode)=>{
            return [
                m("dialog", {
                    open:true,
                    onremove:() => {
                        document.body.style.overflow = null
                    },
                    oncreate: ({dom}) => {
                        // document.body.style.overflow = 'hidden'
                        // dom.showModal()
                        el = dom
                    },
                    onmousedown: (e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if(e.which === 1){
                            move = true
                            document.addEventListener('mousemove', drag)
                            document.addEventListener('mouseup', stop)
                        }
                    },
                    oncancel: () => {
                        modal = false
                        // collection = 'articulos'
                        // m.route.set("/")
                    },
                    style: {
                        // width: vnode.attrs.width || "400px",
                        // height: vnode.attrs.height ||"300px",
                        border: "none",
                        zIndex: "300",
                        overflow: "unset",
                        padding: 0,
                        left: "100px",
                        top: "100px",
                        transformOrigin: "top left",
                        margin:0,
                        borderRadius: "3px"
                    }

                }, [
                    m("button.ui.basic.icon.mini.button",{
                        style: {
                            position: "absolute",
                            right: "0",
                            zIndex: "1",
                            margin: "0",
                            boxShadow: "none"
                        },
                        onclick: vnode.attrs.onclose
                    },m("i.close.icon")),
                    vnode.children
                ])
            ]
        }
    }
}

function saveEditedPage() {
    if(!localStorage.user){
        let user = prompt("Enter your name");
        if(user.trim()){
            localStorage.user = user;
        }else{
            viewMainMessage("error", "No user name");
            return
        }

    }
    disableSavePageButton()
    if (typeof pageData._id != "undefined" && pageData._id.length > 0) {
        savePage(API + getRealm() + "/collections/paginas/" + pageData._id, "PUT")
    } else {
        // guardamos en pageData para no perder los cambios
        const nodo = document.getElementById('main').children
        pageData['segments'] = segment_toJson(nodo)
        viewMainMessage("error", "Esta página no tiene ID. Guárdala como Nueva.")
    }
    unselectItem()
    //$('#saveEditedDataModal').modal('hide')
}

function ZiTYBuilder() {

    let pagemenu = true,
        zoom = localStorage.zoom || 1;
    
    return {
        oninit:()=>{
            document.getElementById("main").style.zoom = zoom
        },
        view: ()=>{
            return [
                m(".top-bar-menu",{
                    /// Hay que resetear css para que no afecte el de la página cargada all: initial;
                    style: {
                        width: "100%",
                        position: "fixed",
                        top: "0px",
                        zIndex: "998",
                        left: "0",
                        transition: "all .3s",
                        display: "flex",
                        flexDirection: "row"
                    },
                },m(TopMenu)),

                pagemenu
                ? m(".side-bar-menu",{
                    style:{
                        zIndex: "998"
                    }
                },m(PageMenu))
                : null,
            ]
        }
    }

    function TopMenu() {
        const buttons = [
            "und","va"
        ]
        const webConfigBtns = [
            {title: "CSS global", onclick:()=> webConfigurationModal('style', 'css')},
            {title: "JS global", onclick:()=> webConfigurationModal('script', 'javascript')},
            {title: "Favicon web", onclick:()=> webFaviconModal()},
            {title: "Dependencias", onclick:()=> webConfigurationModal('dependencies', 'javascript')},
            {
                title: "Limpiar Cache", 
                onclick:()=> {
                    console.log(file_get_segment.cache)
                    file_get_segment.cache = {}

                }
            },
        ]
        let webConfigOpen = false,
            idiomaOpen = false;
        return {
            view: ()=>{
                return [
                    m(".ui.menu",{
                        style: {
                            margin: 0,
                            borderRadius: 0,
                            border: "none",
                        }
                    },[
                        m("a.item",{
                            href: "./",
                            title:"Página de Inicio"
                            },m("i.home.icon")),
                        m("a.item", {
                            href: "https://zity-dashboard.digitalvalue.es/",
                            title: "Dashboard - panel de Zity",
                            target: "_blank"
                        }, [
                            m("img",{
                                style: {
                                    width: "60px",
                                    marginRight: "10px",
                                    filter:  themeMode == "light" ? "invert(1)" : null,
                                },
                                src: "https://cdn.digitalvalue.es/alcantir/assets/5cc03ffd1d8c420100aa90fe?w=300"
                            })
                        ]),
                        m("a.item",{
                                href: window.location.origin + window.location.pathname,
                                target:"_blank",
                            }, [
                            m("i.window.restore.outline.icon"),
                            m("span.title","Nueva Ventana")
                        ]),
                        pageData && pageData._id 
                        ? [
                            m(Preview),
                            m(".ui.dropdown.item",{
                                    tabindex: 0,
                                    onblur:()=>webConfigOpen = false,
                                    onclick:()=>webConfigOpen = !webConfigOpen
                                },[
                                m("i.cog.icon"),
                                m("span.title", "Web config"),
                                webConfigOpen ? (
                                    m(".menu.visible", {
                                        onclick:(e)=> e.stopPropagation(),
                                        style: {display: "block"}
                                    },[
                                        webConfigBtns.map( btn => (
                                            m(".item",{
                                                onclick: btn.onclick
                                            }, btn.title)
                                        ))
                                    ])
                                )
                                : null
                            ]),        
                        ]
                        :null,
                    ]),
                    pageData && pageData._id 
                    ? (
                        m("",{
                            style: {
                                alignSelf: "center",
                                marginLeft: "auto",
                                marginRight: "auto"
                            }
                        }, 
                            m(".ui.small.button", {
                                className: hasChanged ? "positive" : "disabled",
                                onclick: ()=> saveEditedPage(),
                                title: "Actualizar página",
                                id: "active-save-page-button"
                            }, 
                                m("i.sync.icon"),
                                "ACTUALIZAR"
                            ),
                        )
                    )
                    :null,
                    m(".header-links",{
                        style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "1.5rem",
                            marginLeft: "auto",
                        }
                    },[
                        m("a.item", {
                            onclick: changeThemeMode
                        },
                            m("i.large.icon",{
                                className: themeMode === "dark" ? "moon yellow": "sun blue"
                            }),
                        ),
                        m(".ui.dropdown.item",{
                            tabindex: 1,
                            onblur:()=> idiomaOpen = false,
                            onclick:()=> idiomaOpen = !idiomaOpen
                        },[
                            m("i.globe.icon"),
                            m("span.title", getLocale() == 'va' ? "VAL" : "CAS"),
                            idiomaOpen ? (
                                m(".menu.visible",{
                                    style: {display: "block"},
                                    onclick:(e)=> e.stopPropagation()
                                }, [
                                    buttons.map( btn => (
                                        m(".item",{
                                            className: localStorage.lang == btn ? "active" : "",
                                            onclick:(e)=>{
                                                idiomaOpen = false
                                                getLocale(btn)
                                                ActualizarPagina()
                                            }
                                        }, btn == 'va' ? "valenciano" : "castellano")
                                    ))
                                ])
                            )
                            :null
                        ]),
                        m(".item", {
                                style: {fontFamily: "monospace"}
                            },REALM
                        ),
                        m("button.red.ui.icon.button",{
                                style: {
                                    borderRadius: 0
                                },
                                title:"Pulsa para desconectar",
                                onclick:()=> logout()
                            },
                            m("i.icon.sign.out.alternate")
                        )
                    ]),
                ]

                // return m(".ui.equal.width.grid.padded",[
                //     m(".column",{
                //         style: {padding: 0,flexGrow: "0",width:"auto"}
                //     }, m(".ui.inverted.menu",{
                //                 style: {
                //                     background: "#363636",
                //                 }
                //             },
                //             //m("a.item",{onclick:()=>pagemenu=!pagemenu,title:"Menú"},m("i.bars.icon")),
                //             m("a.item",{
                //                 href: "./",
                //                 title:"Página de Inicio"
                //                 },m("i.home.icon")),
                //             m("a.item", {
                //                 href: "https://zity-dashboard.digitalvalue.es/",
                //                 title: "Dashboard - panel de Zity",
                //                 target: "_blank"
                //             }, [
                //                 m("img",{
                //                     style: {
                //                         width: "60px",
                //                         marginRight: "10px",
                //                     },
                //                     src: "https://cdn.digitalvalue.es/alcantir/assets/5cc03ffd1d8c420100aa90fe?w=300"
                //                 })
                //             ]),
                //             m("a.item",{
                //                 href:window.location.href,
                //                 target:"_blank",
                //             }, [
                //                 m("i.file.outline.icon"),
                //                 m("span.title","Nueva Ventana")
                //             ]),
                //             // m("a.item.zoom", {onclick:()=>{
                //             //     zoom/=1.2;
                //             //     localStorage.zoom = zoom
                //             //     xZoom()}
                //             // }, m("i.minus.icon")),
                //             // m(".item.zoom", Math.round(zoom*100) + "%"),
                //             // m("a.item.zoom", {onclick:()=>{
                //             //     zoom*=1.2;
                //             //     localStorage.zoom = zoom
                //             //     xZoom()}
                //             // }, m("i.plus.icon")),
                //     )),

                //     m(".column" , {
                //         style: {padding: 0,flexGrow: "1", width:"auto"}
                //     }, pageData && pageData._id  ? [
                //         m(Preview),
                //         m(".ui.basic.button.inverted.dropdown",{
                //             style: {margin: "0 1rem"},
                //             tabindex: 0,
                //             onblur:()=>webConfigOpen = false,
                //             onclick:()=>webConfigOpen = !webConfigOpen
                //         },[
                //             m("i.cog.icon"),
                //             m("span.title", "Web config"),
                //             webConfigOpen ? (
                //                 m(".menu.visible", {
                //                     onclick:(e)=> e.stopPropagation(),
                //                     style: {display: "block"}
                //                 },[
                //                     webConfigBtns.map( btn => (
                //                         m(".item",{
                //                             onclick: btn.onclick
                //                         }, btn.title)
                //                     ))
                //                 ])
                //             )
                //             : null
                //         ]),

                //         m(".ui.basic.inverted.button",{
                //             style: {
                //                 position: "relative",
                //                 padding: "11px 22px 11px 11px"
                //             },
                //             className: consoleOpen ? 'active': '',
                //             onclick:()=> consoleOpen = !consoleOpen
                //         },[
                //             m("i.bug.icon"),
                //             m("span.title", {
                //                 style: {marginRight: "1em"}
                //             },"Consola"),
                //             m(".ui.circular.label", {
                //                 className: pageData.errors.length ? "red" : "",
                //                 style: {
                //                     position: "absolute",
                //                     top: "6px",
                //                     right: "5px"
                //                 }
                //             }, pageData.errors.length ? pageData.errors.length : "0") 

                //         ]),

                //         m(".ui.labeled.input", {style: {height:"calc(100% - 3px)"}
                //             },[
                //             m(".ui.teal.label", "https"),
                //             m("input", {
                //                 style: {padding: "2px 1rem"},
                //                 type: "text",
                //                 value: pageData.name
                //             })
                //         ]),
                //     ] : null),

                //     m(".column",{
                //             style: {
                //                 padding: "3px",
                //                 textAlign: "right",flexGrow: "0",width:"auto"
                //             }
                //         },[

                //         // HAbría que pasar también una variable para guardar el usuario
                //         // Necesita que la página esté cargada
                //        // pageData._id &&  m("span", m(Collaboration,{location:pageData._id,key:pageData._id})),

                //         m(".ui.basic.inverted.button.dropdown",{
                //             style: {margin: "0 1rem"},
                //             tabindex: 1,
                //             onblur:()=> idiomaOpen = false,
                //             onclick:()=> idiomaOpen = !idiomaOpen
                //         },[
                //             m("i.globe.icon"),
                //             m("span.title", getLocale() == 'va' ? "VAL" : "CAS"),
                //             idiomaOpen ? (
                //                 m(".menu.visible",{
                //                     style: {display: "block"},
                //                     onclick:(e)=> e.stopPropagation()
                //                 }, [
                //                     buttons.map( btn => (
                //                         m(".item",{
                //                             className: localStorage.lang == btn ? "active" : "",
                //                             onclick:(e)=>{
                //                                // e.preventDefault();
                //                                 idiomaOpen = false
                //                                 getLocale(btn)
                //                                 ActualizarPagina()
                //                             }
                //                         }, btn == 'va' ? "valenciano" : "castellano")
                //                     ))
                //                 ])
                //             )
                //             :null
                //         ]),
                //         m("span", {style: {color: "#fff", marginRight: "10px"}}, REALM),
                //         m("button.red.small.ui.icon.button",{
                //             title:"Pulsa para desconectar",
                //             onclick:()=> logout()
                //         },
                //         m("i.icon.sign.out.alternate"))
                //     ]),
                // ])
            }
        }
    }
}

function EditionMenu() {
    let importsegment=false
    let nuevocomponente=false
    let componentmenu
    let addsegment=false
    let moveelement=false
    let alignment=false
    let newcomponent=false
    let datasourcelement=false
    let css=false

    const alignmentButtons = [
        {title: "Centrado", onlick: ()=>alignElement("centered"), icon:"center"},
        {title: "Justify", onlick: ()=>alignElement("justify"), icon:"justify"},
        {title: "Izquierda", onlick: ()=>alignElement("left"), icon:"left"},
        {title: "Derecha", onlick: ()=>alignElement("right"), icon:"right"}
    ]

    return {
        oninit:()=>{
           // componentmenu = componentMenu();
        },
        view: ()=>{
            const selectedItemType = selectedItem && selectedItem.hasAttribute("data-editor")
            ? selectedItem.getAttribute("data-editor")
            : ""
            return [
                m("div", { 
                    //style: { display: "flex", zIndex: 999 }
                
            }, [

                datasourcelement && selectedItem
                ? m(DataSourceElement)
                : null,

                m("div", [

                    css
                    ? m(CssEditor)
                    : null,

                    m(".ui.big.vertical.black.buttons", [
                        m(".ui.icon.vertical.buttons",{
                                id: "edit-edition-menu",
                                style: {marginBottom: ".25rem"}
                            },[
                            // m("button.ui.button", {
                            //         title: "Clonar elemento",
                            //         onclick: ()=>cloneElement(selectedItem)
                            //     },m("i.blue.clone.icon")),

                            // m(".ui.dropdown.icon.button",{
                            //     title: "Mover elemento",
                            //     onclick:()=>moveelement=!moveelement
                            // },[
                            //     m("i.arrows.alternate.icon"),
                            //     moveelement
                            //     ? m("div.transition.visible.left.menu",[
                            //         m(".item",{
                            //             title: "Mover Arriba",
                            //             onclick:()=>moveElement("up")
                            //         },[
                            //             m("i.up.arrow.icon"),
                            //             m("span.text","Arriba")
                            //         ]),

                            //         m(".item",{
                            //             title: "Mover Abajo",
                            //             onclick:()=>moveElement("down")
                            //         },[
                            //             m("i.down.arrow.icon"),
                            //             m("span.text", "Abajo")
                            //         ])
                            //     ])
                            //     : null
                            // ]),

                            // m("button.ui.icon.button", {
                            //     title: "Ir al padre",
                            //     onclick:()=>upToParent()
                            // },m("i.angle.double.up.icon")),
                            m(".ui.icon.button", {
                                title: "Editar estilo",
                                onclick:()=>css=!css,
                                className: css ? "active" : null
                            }, [
                                m("i.tint.icon")
                            ]),
                            // m(".ui.dropdown.icon.button",{
                            //     title: "Alineación de texto",
                            //     onclick:()=>alignment=!alignment
                            // },[
                            //     m("i.align.justify.icon"),
                            //     alignment
                            //     ? m("div.transition.visible.left.menu",[

                            //         m(".item",{
                            //             title: "Centrado",
                            //             onclick:()=>alignElement("center")
                            //         },[
                            //             m("i.align.center.icon"),
                            //             m("span.text","Centrado")
                            //         ]),

                            //         m(".item",{
                            //             title: "Justificado",
                            //             onclick:()=>alignElement("justify")
                            //         },[
                            //             m("i.align.justify.icon"),
                            //             m("span.text","Justificado")
                            //         ]),

                            //         m(".item",{
                            //             title: "Izquierda",
                            //             onclick:()=>alignElement("left")
                            //         },[
                            //             m("i.align.left.icon"),
                            //             m("span.text", "Izquierda")
                            //         ]),

                            //         m(".item",{
                            //             title: "Derecha",
                            //             onclick:()=>alignElement("right")
                            //         },[
                            //             m("i.align.right.icon"),
                            //             m("span.text", "Derecha")
                            //         ])
                            //     ])
                            //     : null
                            // ]),
                            m("button.ui.icon.button",{
                                    title: "Contenido JSON",
                                    onclick:()=>openDefaultModal("javascript","stringify")
                                },m("i.info.icon")),

                            // m("button.ui.icon.button", {
                            //         title: "Contenido actual",
                            //         onclick:()=>openDefaultModal("javascript","source")
                            //     },"S"),

                            // selectedItem && selectedItem.hasAttribute("href") ?
                            // m(".ui.icon.button", {
                            //     title: "Cambiar de página",
                            //     onclick:()=>{
                            //         var href = selectedItem.getAttribute("href");
                            //         var match = href.match(/(\\w+).*/); window.open("?"+match[1], "")
                            //     }
                            // },m("i.external.alternate.icon"))
                            // :null,

                        ]),

                        m(".ui.icon.vertical.black.buttons",{
                            style: {marginBottom: ".25rem"}
                        }, [

                            selectedItemType == "segment"
                            ? [
                                m(".ui.dropdown.icon.button",{
                                    title: 'Recoger Plantilla',
                                    onclick:()=> importsegment=!importsegment,
                                    className: importsegment ? "active" : null
                                }, m("i.long.arrow.alternate.left.icon")),
                                // m(".ui.icon.button", {
                                //     title: "Editar tamaño",
                                //     onclick:()=>{
                                //         if (hasClass(selectedItem, "column")) openSizeColumnModal();
                                //         else openSizeContainerModal()
                                //     }
                                // },m("i.expand.icon")),
                                m(".ui.icon.button",{
                                    title: "Añadir nuevo componente al segmento",
                                    onclick:()=>newcomponent=!newcomponent,
                                    className: newcomponent ? "active" : null
                                },m("i.paint.brush.icon")),

                                m(".ui.icon.button", {
                                    title: "Insertar párrafo",
                                    onclick:()=>addElement("dv-simple", "p", ""),
                                    style: {fontSize: "16px", "line-height": "21px"}
                                }, "Txt"),

                                m(".ui.icon.button", {
                                    title: "Insertar dv-simple imagen",
                                    onclick:()=>addElement("dv-simple", "img", "")
                                },m("i.image.icon")),

                                m(".ui.icon.button", {
                                    title: "Copiar y Pegar cualquier cosa",
                                    onclick:()=>addElement("dv-simple", "div", "")
                                    // style: {fontSize: "16px", "line-height": "21px"}
                                }, m.trust(`<svg fill="#fff" height="21" width="21" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m326.714844 263.347656 60.734375-72.382812.015625-.015625c-34.011719-24.953125-74.191406-39.625-116.679688-42.429688v94.472657h-30.019531v-94.472657c-42.492187 2.804688-82.671875 17.476563-116.679687 42.429688l60.75 72.398437-22.996094 19.296875-60.71875-72.363281c-1.070313 1.027344-2.140625 2.058594-3.191406 3.113281-42.164063 42.160157-65.386719 98.21875-65.386719 157.847657 0 5.03125.167969 9.957031.484375 14.839843h445.492187c.316407-4.882812.484375-9.808593.484375-14.839843 0-59.628907-23.222656-115.683594-65.382812-157.847657-1.050782-1.050781-2.121094-2.085937-3.191406-3.113281l-60.722657 72.363281zm0 0"/><path d="m36.699219 416.097656h-2.015625l.050781 95.902344h442.078125l.054688-95.902344zm0 0"/><path d="m270.785156 148.453125v-54.898437c19.128906-6.316407 32.976563-24.351563 32.976563-45.570313 0-26.457031-21.527344-47.984375-47.988281-47.984375-26.457032 0-47.984376 21.527344-47.984376 47.984375 0 21.21875 13.847657 39.253906 32.976563 45.570313v54.898437zm0 0"/><path d="m124.078125 190.941406 60.757813 72.40625-60.753907-72.398437-35.304687-42.078125c10.59375-17.132813 9.609375-39.851563-4.027344-56.105469-9.140625-10.890625-22.546875-17.140625-36.777344-17.140625-11.25 0-22.199218 3.988281-30.828125 11.230469-9.816406 8.238281-15.839843 19.808593-16.957031 32.578125-1.117188 12.765625 2.804688 25.207031 11.042969 35.023437 9.140625 10.894531 22.546875 17.144531 36.777343 17.144531 6.125 0 12.152344-1.191406 17.773438-3.433593l35.300781 42.066406zm0 0"/><path d="m511.363281 119.429688c-1.117187-12.769532-7.140625-24.335938-16.960937-32.574219-8.625-7.242188-19.574219-11.230469-30.828125-11.230469-14.230469 0-27.632813 6.246094-36.773438 17.140625-13.640625 16.253906-14.621093 38.972656-4.03125 56.105469l-35.304687 42.078125-.015625.015625 22.996093 19.296875-60.738281 72.382812 60.722657-72.363281 35.339843-42.117188c5.617188 2.246094 11.648438 3.4375 17.773438 3.4375 14.230469 0 27.636719-6.25 36.773437-17.144531 8.242188-9.816406 12.164063-22.257812 11.046875-35.027343zm0 0"/></svg>`)),

                                // !!! sacar el SVG a una libreria

                                m(".ui.icon.button", {
                                    title: "Insertar dato",
                                    onclick:()=>datasourcelement=!datasourcelement,
                                    className: datasourcelement ? "active" : null
                                },m("i.ui.database.icon")),

                                // m(".ui.icon.button", {
                                //     title: "Editar estilo",
                                //     onclick:()=>css=!css,
                                //     className: css ? "active" : null
                                // }, [
                                //     m("i.tint.icon")
                                // ]),

                                // m(".ui.icon.button", {
                                //     title: "Editar estilo bloque",
                                //     onclick:()=>openDefaultModal("css","segmentCSS")
                                // },m("i.tint.blue.icon"))
                            ]
                            :null,


                        ]),

                        m("button.ui.icon.button", {
                            title: "Eliminar elemento seleccionado",
                            onclick:()=>deleteElement(selectedItem)
                        },m("i.red.trash.icon")),
                        m("button.ui.icon.button",{
                            title:"Cerrar Menú",
                            onclick:()=>{
                                unselectItem()
                                datasourcelement = false
                                importsegment = false
                            }
                        }, m("i.close.icon"))
                    ])
                ]),


                control.menucollapsible
                ? m("div", [
                    m(MenuCollapsible, {
                        realm: getRealm(),
                        json: pageData,
                        className: "item",
                        tagName: "a",
                        close: () => control.menucollapsible = false
                    })
                ])
                : null,


                importsegment && selectedItem
                ? m(ImportSegment, {onclose: () => importsegment = false, segment: importsegment})
                : null,

                newcomponent && selectedItem
                ? m(ComponentsList, {onclose: () => newcomponent = false})
                : null,


            ])
            ]
        }
    }


    function CssEditor() {
        let active
        let modal = false,
            tabMenu = null,
            selected;
            //colorPicker = false


        function EditionStyleInput() {
            return {
                view: ({attrs}) => {
                    const { name, placeholder, style } = attrs
                    return m(".ui.icon.input", { style }, [
                        m("input", {
                            value: selectedItem.style[name],
                            placeholder: placeholder,
                            onchange: (e) => updateStyle(name, e.target.value)
                            // updateStyle("backgroundImage", `url('${full[0].href}')`)
                        }),
                        m("i.red.close.link.icon", {
                            onclick: (e) => updateStyle(name, "")
                        })
                    ])
                }
            }
        }

        function CleanStyleButton() {
            return {
                view: ({attrs}) => {
                    const { name, title = "", callback } = attrs
                    return [
                        m(Icon, {
                            icon: "eraser",
                            onclick: () => {
                                updateStyle(name, "");
                                if(callback && typeof callback =="function") callback()
                            }
                        }),
                        localize(title),
                    ]
                }
            }
        }

        function CloseIcon() {
            return {
                view: ({attrs}) => {
                    const { callback } = attrs
                    return m("p", {
                        style: "text-align: right; margin:0;position:absolute;right:0;z-index: 100"
                    }, m(Icon, {
                        icon: "close",
                        className: "small black",
                        style: "cursor: pointer;",
                        onclick: () => callback()
                    }))
                }
            }
        }

        function updateStyle(name, value) {
            if (!selectedItem)
                return
            selectedItem.style[name] = value
        }

        function incrementar(i, name) {
            if (!selectedItem.style[name])
                return selectedItem.style[name] = "1px"
            let match = selectedItem.style[name].match(/^-?[0-9]+/);
            const num = Number(match[0]);
            console.log(num)
            let n = Number(match[0]) + i
            updateStyle(name, `${n}px`)
        }

        function InputNumber(){
                //`${selectedBorder}Width`
            let unit = "px",
                value = 0,
                step = 1
            return {
                oninit:({attrs})=>{
                    if(selectedItem.style[attrs.attribute]){
                        const match = selectedItem.style[attrs.attribute].match(/^-?[0-9]*\.?[0-9]+/)
                        if(match)
                            value = match[0]
                        else
                            value = selectedItem.style[attrs.attribute]
                    }
                    //enteredValue = selectedItem.style[attrs.attribute] ? selectedItem.style[attrs.attribute].match(/^-?[0-9]*\.?[0-9]+/)[0]
                },
                onupdate:({attrs})=>{
                    unit = attrs.unit
                     if(selectedItem.style[attrs.attribute]){
                        if(!selectedItem.style[attrs.attribute].includes(" ")){
                            const match = selectedItem.style[attrs.attribute].match(/^-?[0-9]*\.?[0-9]+/)
                            if(match)
                                value = match[0]
                        }
                        else
                            value = selectedItem.style[attrs.attribute]
                    }
                    if(unit == 'px') step = 1
                    else step = 0.25
                },
                view: ({attrs})=> m(".ui.basic.label",{
                        style: {
                            maxWidth: "70px",
                            padding: "10px 0 8px 8px"
                        }
                    },
                    m("input",{
                            type: "number",
                            value: value,
                            step: step,
                            style:{border: "none",outline:"none", width: "-webkit-fill-available",verticalAlign: "-webkit-baseline-middle"},
                            oninput: (e)=>{
                                let val = 0;
                                if(e.target.value)
                                    val =  `${e.target.value}${unit}`
                                updateStyle(attrs.attribute, val)
                            }
                        })
                )

                // m(".ui.basic.label",{
                //             style:{display: "inline-flex",alignItems:"center",paddingRight: 0}
                //         }, [
                //         value,
                //         m("",{style: {display:"inline-flex",flexDirection: "column",marginLeft: ".25rem"}},[
                //             m("i.caret.up.icon", {onclick: () => incrementar(1, attrs.attribute)}),
                //             m("i.caret.down.icon", {onclick: () => incrementar(-1, attrs.attribute)}),
                //         ]),
                //     ])
            }

            function incrementar(i, name) {
                if (!selectedItem.style[name])
                    return selectedItem.style[name] = "1px"
                const match = selectedItem.style[name].match(/^-?[0-9]*\.?[0-9]+/)
                const n = parseFloat(match[0]) + i
                updateStyle(name, `${n}${unit}`)
            }

            function updateValue(name){
                if(!selectedItem.style[name]) return

                let match = selectedItem.style[name].match(/^-?[0-9]*\.?[0-9]+/)
                let n = parseFloat(match[0])
                console.log(selectedItem.style[name], selected, n)
                let value = 0;
                if(selectedItem.style[name].indexOf('px') != -1){
                    console.log("REM > PX", n)
                    if(selected == 'rem' || selected == 'em')
                        value = n * 0.063
                }else{
                    if(selected == 'px'){
                        console.log("PX > REM", n)
                        value = Math.floor(n / 0.063)
                    }
                }
                console.log("Result: ", value)
                 updateStyle(name, `${value}${selected}`)
            }
        }

        function ComponentTitle(){
            return {
                view: ({attrs})=>{
                    const {title} = attrs
                    return [
                        m(CloseIcon, {callback: () => tabMenu = null}),
                        m(".item.ui.header", [
                            title,
                            m(".ui.sub.header",{
                                style: {textTransform: "lowercase"}
                            }, selectedItem.className ? Array.from(selectedItem.classList).join(".").toLowerCase() : null)
                        ])
                    ]
                }
            }
        }



        function CssAttributeEditor(){
            let active = false,
                cssAttrName,
                newOf123=["","top","right","bottom","left"],
                custom = false,
                openCustomMenu = false,
                checked = "all",
                hasAttr = false,
                selectedDropdownOption = 'px',
                defaultOptions = "auto",
                retweet = false;


            return {
                oninit:({attrs})=>{
                    cssAttrName = attrs.cssAttrName;
                    if(selectedItem.style[cssAttrName])
                        hasAttr = true
                    newOf123.map( (key, i) => {
                        newOf123[i] = cssAttrName + key
                    })
                },
                onbeforeupdate:()=>{
                    if(selectedItem.style[cssAttrName])
                        hasAttr = true
                    else hasAttr = false
                },
                view: () => {
                    return [
                        cssAttrName,
                        !hasAttr
                        ?  m(Button, {
                                title: "Add " + cssAttrName,
                                className: "basic mini icon",
                                callback:()=> {
                                    selectedItem.style[cssAttrName] = `16px`
                                }
                            },m("i.plus.icon")
                        )
                        :null,
                        hasAttr
                        ? m(".ui.segment",{
                                style: {display: "flex",alignItems: "center",flexWrap: "wrap"}
                            }, [
                            //Increment and decrement operators
                            retweet
                            ? [
                                    m(InputNumber, {attribute: cssAttrName, unit: selectedDropdownOption}),
                                    m(SelectedDropdown,{
                                        defaultValue: selectedDropdownOption,
                                        items: ["px","rem","em"],
                                        callback: (value)=> {
                                            selectedDropdownOption = value
                                           // updateStyle(cssAttrName, )
                                        }
                                    })
                                ]
                            : m(SelectedDropdown,{
                                        defaultValue: "auto",
                                        items: ["auto","inherit","revert","initial","unset"],
                                        callback: (value)=> {
                                            defaultOptions = value
                                            updateStyle(cssAttrName, value )
                                        }
                                    }),
                            m(Button,{
                                    callback:()=> retweet = !retweet,
                                    noBorder: true,
                                    className:" basic icon"
                                },
                                m("i.retweet.icon")),
                            //Select css attribute rule
                            m(".ui.dropdown",{
                                    style:{marginLeft: "auto"},
                                    tabindex: 0,
                                    onblur:()=> openCustomMenu = false
                                },[
                                    m(Button, {
                                            noBorder: true,
                                            className: "basic icon",
                                            callback:()=>  openCustomMenu = !openCustomMenu
                                        },
                                        checked != 'custom'
                                        ? m(SvgIcon,{icon: "border-" + checked})
                                        : m("i.sliders.horizontal.icon")
                                    ),
                                    openCustomMenu
                                    ? m(".left.menu.transition.visible",{
                                            style: {display: "block"}
                                        },[
                                        m(CustomMenu)
                                    ])
                                    : null
                            ]),
                            //Remove css attribute button
                            m(Button, {
                                    noBorder: true,
                                    title: "Remove " + cssAttrName,
                                    className: "basic mini icon",
                                    callback:()=>  {
                                        updateStyle(cssAttrName, "");
                                        hasAttr = !hasAttr
                                    }
                                },
                                m("i.minus.icon")
                            ),
                            custom
                            ? m(".item",{
                                    style: {width: "100%"}
                                }, m(Custom))
                            : null
                        ])
                        :null,
                    ]
                }
            }

            function CustomMenu(){
                const options = [
                        "all",
                        "top",
                        "bottom",
                        "left",
                        "right",
                    ];
                return {
                    view: ()=>{
                        return [
                            options.map((item, i) => m(".item", {
                                            key: item,
                                            onclick:()=> {
                                                checked = item;
                                                openCustomMenu = false;
                                                custom = false
                                            }
                                        }, [
                                            m("i.green.icon",{
                                                className: checked == item ? "check" : null
                                                }),
                                            m(SvgIcon,{icon: "border-" + item}),
                                            m("span",{
                                                style: {marginLeft: "1em"}
                                            }, item)
                                        ])
                            ),
                            m(".ui.divider"),
                            m(".item",{
                                onclick:()=>{
                                    checked = "custom";
                                    openCustomMenu = false;
                                    custom = true
                                }
                            },[
                                m("i.green.icon",{
                                    className:  checked == "custom" ? "check" : null
                                }),
                                m("i.sliders.horizontal.icon"),
                                "Custom"
                            ])
                        ]
                    }
                }
            }

            function Custom(){
                const btns = ["left", "top", "right", "bottom"]
                return {
                    view:()=>{
                        return m(".ui.two.column.grid", [
                            btns.map( btn => m(".column", {key: btn}, [
                                m(SvgIcon,{icon: `border-${btn}`}),
                                m(InputNumber, {attribute: `${cssAttrName}-${btn}`,  unit: selectedDropdownOption}),
                            ]))
                        ])
                    }
                }
            }
        }

        function BorderEditor() {
            let  selectedBorder = null,
                borders = ["border", "borderTop", "borderRight", "borderBottom", "borderLeft"];


            function Border() {
                let hasBorder = false,
                    style = {
                        width: "18px",
                        height: "18px",
                        display: "inline-block",
                        borderRadius: "2px"
                    },
                    borderName;
                return {
                    oninit:({attrs})=>{
                        borderName = attrs.border
                        hasBorder = borderName && selectedItem.style[borderName] ? true : false
                    },
                    onbeforeupdate:({attrs})=>{
                        borderName = attrs.border
                        hasBorder = borderName && selectedItem.style[borderName] ? true : false
                    },
                    view: () => {
                        style[borderName] = "2px solid " + (hasBorder ? "#000" : "#b2b2b2")
                        return [
                            m(".item", {
                                    className: borderName == selectedBorder ? "active" : null,
                                    onclick: () => {
                                        selectedItem.style[borderName] = "4px solid #CACBCC"
                                        selectedBorder = borderName
                                        console.log(selectedBorder)
                                    }
                                },
                                m("a", {
                                    style: {
                                        backgroundColor: hasBorder ? "#ddd" :"rgb(242 242 242)",
                                        ...style
                                    },
                                })
                            )
                        ]
                    }
                }
            }

            function LabelCounter(){
                //`${selectedBorder}Width`
                return {
                    view: ({attrs})=> m(".ui.label.basic",{style:{display: "inline-flex",alignItems:"center"}},[
                        selectedItem.style[attrs.attribute] || "0px",
                        m("",{style: {display:"inline-flex",flexDirection: "column",marginLeft: "1rem"}},[
                            m("i.caret.up.icon", {onclick: () => incrementar(1, attrs.attribute)}),
                            m("i.caret.down.icon", {onclick: () => incrementar(-1, attrs.attribute)}),
                        ]),
                    ])
                }
            }

            return {
                view: () => [
                    m(".item",[
                        m(".ui.tabular.top.attached.small.menu", {
                            style: { marginLeft: "0" },//
                        },[
                            borders.map(border => m(Border, {border}))
                        ]),
                        selectedBorder
                        ? [
                            m(".ui.segment.bottom.attached",{
                                style: { display: "flex", justifyContent: "space-between", alignItems: "center"}
                            },[
                                m(LabelCounter,{attribute: `${selectedBorder}Width`}),
                                m(ColorPickerContainer,{attribute: selectedBorder + 'Color'}),
                                m(".field", m(Select, {
                                    data: selectedItem.style,
                                    name: `${selectedBorder}Style`,
                                    placeholder: "solid",
                                }, ["none", "hidden", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset", "initial", "inherit"])),
                                m(CleanStyleButton, {
                                    name: selectedBorder,
                                    callback:()=> selectedBorder = null
                                })
                            ]),
                        ]
                        : null,
                    ]),
                    m(".item", [
                            m("p", m("strong", "Border Radius")),
                            m("",[
                                m(LabelCounter,{attribute: `borderRadius`}),
                                m("span" ,
                                    m(CleanStyleButton, {
                                        name: "borderRadius",
                                    })
                                )
                            ])
                    ]),
                    m(".item", m(CleanStyleButton, {
                        name: "border",
                        title: "Limpia estilo de borde"
                    }))
                ]
            }
        }

        function ColorPickerContainer (){
            let colorPicker = false;

            return {
                view: ({attrs})=>{
                    let { attribute, title } = attrs
                    return [
                        title ? m("strong", title): null,
                        m(".ui.label",{
                                style: {
                                    backgroundColor: selectedItem.style[attribute],
                                    width: "36px",
                                    height: "36px",
                                    display: "inline-block",
                                    boxShadow: "0 0 0 1px #cecece"
                                },
                                onclick:()=> {
                                    if(colorPicker == attribute)
                                        colorPicker = null
                                    else
                                        colorPicker = attribute
                                }
                        }),
                        colorPicker
                        ? m("div",{
                                style: {
                                    position: "absolute",
                                    zIndex: "100",
                                    left: "-320px",
                                    top:"0em",
                                    background: "#fff",
                                    padding: "1rem",
                                    border: "1px solid #5a5a5a",
                                    maxWidth: "300px"
                                }
                            },[
                                m(CloseIcon, {callback: () => {
                                        colorPicker = null
                                    }
                                }),
                                m(ColorPicker, {
                                    callback: (e) => updateStyle(attribute, e),
                                    selected: selectedItem.style[attribute]
                                })
                        ])
                        :null,
                    ]
                }
            }
        }

        function BackgroundEditor() {
            return {
                view: () => [
                    m(".item", m(ColorPickerContainer,{attribute: 'backgroundColor',title: "background-color"})),
                    m(".item", [
                        m("p", m("strong", "backgroundImage")),
                        m(".ui.segment",{
                                style: {textAlign: "center"}
                            },[
                            m(".ui.label", {
                                onclick: () => modal = !modal,
                                style: {
                                    cursor: "pointer"
                                }
                            }, [
                                m("i.image.icon"),
                                "Selecciona"
                            ]),
                            m(".ui.horizontal.divider", "or"),
                            m(EditionStyleInput, {
                                name: "backgroundImage",
                                placeholder: "url('https://xxxx')"
                            })
                        ])
                    ]),
                    m(".item", [
                        m("p",[
                            m("strong", "backgroundPosition"),
                            m("a.circular.ui.mini.icon.button", {
                                title: "Ir a w3schools",
                                style: {float: "right"},
                                onclick: () => { window.open("https://www.w3schools.com/cssref/pr_background-position.asp",'_blank').focus()
                                    },
                                target: "_blank"
                            }, m("i.question.icon"))
                        ]),
                        m(EditionStyleInput, {
                            name: "backgroundPosition",
                            placeholder: "left top | 0% 0% | 0px 0px"
                        })
                    ]),
                    m(".item", [
                        m("p", m("strong", "backgroundRepeat")),
                        m(Select, {
                            data: selectedItem.style,
                            name: "backgroundRepeat",
                            placeholder: "repeat"
                        }, ["repeat","repeat-x","repeat-y","no-repeat","initial","inherit"])
                    ]),
                    m(".item", [
                        m("p", m("strong","backgroundSize")),
                        m(Select, {
                            data: selectedItem.style,
                            name: "backgroundSize",
                            placeholder: "auto"
                        }, ["auto","contain","cover","revert","initial","inherit", "unset", "100% 100%"])
                    ]),
                    m(".item", m(CleanStyleButton, {
                        name: "background",
                        title: "Limpia estilo de background"
                    }))

                ]
            }
        }

        function FontEditor() {
            let hasColor = false;
            function checkColor(){
                if(selectedItem.style.color)
                    hasColor = true
                else
                    hasColor = false
            }
            return {
                oninit:()=>{
                    checkColor()
                },
                onupdate:()=>{
                    checkColor()
                },
                view: () => [
                    m(".item", m(ColorPicker, {
                        callback: (e) => updateStyle("color", e),
                        selected: selectedItem.style["color"]
                    })),
                    hasColor ? m(".item", m(CleanStyleButton, {
                        name: "color",
                        title: "Quitar el color",
                        callback:()=> hasColor = false
                    }))
                    :null,
                    m(".item",[
                        m("p", [
                            m("strong", "Font Size")
                        ]),
                        m(".ui.form", m(".two.fields", [
                            m(".field", m(EditionStyleInput, {
                                name: "fontSize",
                                placeholder: "16px"
                            })),
                            m(".field", m(Select, {
                                data: selectedItem.style,
                                name: "fontSize",
                                placeholder: "initial",
                            }, ["medium","xx-small","x-small","small","large","x-large","xx-large","smaller","larger","initial","inherit"]))
                        ]))
                    ]),
                    m(".item",[
                        m("p", [
                            m("strong", "Font Style"),
                            m("span", {style: {float: "right"}},
                                m(CleanStyleButton, {
                                    name: "fontWeight",
                                })
                            )
                        ]),
                        m(Select, {
                            data: selectedItem.style,
                            name: "fontStyle",
                            placeholder: "normal"
                        }, ["normal","italic","oblique","initial","inherit"])
                    ]),
                    m(".item",[
                        m("p",[
                            m("strong", "Font Weight"),
                            m("span", {style: {float: "right"}},
                                m(CleanStyleButton, {
                                    name: "fontWeight",
                                })
                            )
                        ]),
                        m(Select, {
                            data: selectedItem.style,
                            name: "fontWeight",
                            placeholder: "normal"
                        }, ["normal","bold","bolder","lighter","100","200","300","400","500","600","700","800","900","initial","inherit"]),
                    ]),
                    m(".item", m(CleanStyleButton, {
                        name: "font",
                        title: "Limpia estilo de fuente"
                    }))
                ]
            }
        }
        // function ColorEditor() {
        //     return {
        //         view: () => {
        //             return [
        //                 m(".item", m(ColorPicker, {
        //                     callback: (e) => updateStyle("color", e),
        //                     selected: selectedItem.style["color"]
        //                 })),
        //                 m(".item", m(CleanStyleButton, {
        //                     name: "color",
        //                     title: "Limpia estilo de color del texto"
        //                 }))
        //             ]
        //         }
        //     }
        // }
        function MarginEditor() {
            const fields = ["marginTop", "marginRight", "marginBottom", "marginLeft"];
            let config = false;

            function Field() {
                return {
                    view: ({attrs}) => {
                        const { name } = attrs
                        return [
                            m("p", m("strong" , name)),
                            m(EditionStyleInput, {
                                name: name,
                                placeholder: "1px"
                            })
                        ]
                    }
                }
            }

            return {
                view: () => {
                    return [
                        m(".item", m(CssAttributeEditor, {
                            cssAttrName: 'margin'
                        })),
                        //  m(".item", m(CleanStyleButton, {
                        //     name: "margin",
                        //     title: "Limpia margin"
                        // }))
                    ]
                    // return [
                    //     m(".item",[
                    //         m("strong" , 'margin'),
                    //         m(EditionStyleInput, {
                    //             name: "margin",
                    //             placeholder: "1px"
                    //         }),
                    //         m("i.cog.icon",{
                    //             onclick: ()=> config = !config
                    //         })
                    //     ]),
                    //     config ?  [
                    //         fields.map(name =>  m(".item",{ key: name}, m(Field, {name})))
                    //     ]
                    //     :null,
                    //     m(".item", m(CleanStyleButton, {
                    //         name: "font",
                    //         title: "Limpia margin"
                    //     }))
                    // ]
                }
            }
        }

        function PaddingEditor() {
            const fields = ["padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft"]

            function Field() {
                return {
                    view: ({attrs}) => {
                        const { name } = attrs
                        return m(".item", [
                            m("p", m("strong" , name)),
                            m(EditionStyleInput, {
                                name: name,
                                placeholder: "1px"
                            })
                        ])
                    }
                }
            }

            return {
                view: () => {
                    return [
                        [
                            fields.map(name => m(Field, {name}))
                        ],
                        m(".item", m(CleanStyleButton, {
                            name: "font",
                            title: "Limpia padding"
                        }))
                    ]
                }
            }
        }

        function AlignEditor(){
            const verticalBtns = [
                        "start", "center", "end"
                    ],
                horizontalBtns = [
                    "left", "center","right","justify"
                ];
            let horizontalALigned = null,
                verticalALigned = null,
                isFlex;

                function controller(){
                    isFlex = selectedItem.style.display == "flex" || selectedItem.style.display == "inline-flex" ? true : false
                    if(selectedItem.style.textAlign) horizontalALigned = selectedItem.style.textAlign
                    else horizontalALigned = null

                    if(selectedItem.style.justifyContent) verticalALigned = selectedItem.style.justifyContent
                    else verticalALigned = null
                    console.log(verticalALigned)
                }
            return {
                oninit:()=>controller(),
                onbeforeupdate:()=>controller(),
                view: () => {
                    return [
                        m(".item", [
                            m("p",[
                                m("strong", "Horizontal"),
                                m("span", {
                                        style: {
                                            float: "right",
                                            visibility: horizontalALigned ? "visible": "hidden"
                                        },
                                    },
                                    m(CleanStyleButton, {
                                        name: "text-align",
                                    })
                                )
                            ]),
                            horizontalBtns.map( item => {
                                return m("a.ui.small.icon.button", {
                                    className: horizontalALigned == item ? "active": null,
                                    onclick:()=> selectedItem.style.textAlign = item
                                },
                                    m("i.align.icon",{
                                        className: item,
                                    })
                                )
                            })
                        ]),
                        m(".item", [
                            m("p", [
                                m("strong" , "Vertical"),
                                m("span", {
                                        style: {
                                            float: "right",
                                            visibility: verticalALigned ? "visible": "hidden"
                                        },
                                        onclick:()=>{
                                            selectedItem.style.display = null
                                            selectedItem.style.justifyContent = null
                                            selectedItem.style.flexDirection = null
                                        }
                                    },
                                    m("i.eraser.icon"))
                            ]),
                            verticalBtns.map( item => {
                                return m("a.ui.small.icon.button", {
                                    className: verticalALigned == item ? "active": null,
                                    onclick:()=> {
                                        if(!isFlex)
                                            selectedItem.style.display = 'flex'
                                        selectedItem.style.justifyContent = item
                                        selectedItem.style.flexDirection = "column"
                                    }
                                },m(SvgIcon,{icon: `aligned-${item}`}))
                            })
                        ]),
                    ]
                }
            }
        }
        function CssGrid(){
            let cols,
                gap,
                isGrid,
                isParentGrid,
                itemColStart,
                itemColEnd,
                itemRowStart,
                itemRowEnd,
                parentCols,
                rowsLength;

            function updateGridState(){
                isGrid = selectedItem.style.display == "grid" || selectedItem.style.display == "inline-grid" ? true : false;
                isParentGrid = selectedItem.parentElement.style.display == "grid" || selectedItem.parentElement.style.display == "inline-grid" ? true : false;
                if(isParentGrid){
                    let matchParentCols = selectedItem.parentElement.style.gridTemplateColumns ? selectedItem.parentElement.style.gridTemplateColumns.match(/[1-9]{1,16}/gm) : [1]
                    parentCols = Number(matchParentCols[0])
                    rowsLength = Math.floor(selectedItem.parentElement.childNodes.length / parentCols)

                }
                const match = selectedItem.style.gridTemplateColumns ? selectedItem.style.gridTemplateColumns.match(/[1-9]{1,16}/gm) : [1]
                const matchGap = selectedItem.style.gap ? selectedItem.style.gap.match(/[0-9]*/g) : [0]

                cols = Number(match[0])
                gap = Number(matchGap[0])

                itemColStart = Number(selectedItem.style.gridColumnStart) || 1
                itemColEnd = Number(selectedItem.style.gridColumnEnd) || 2

                itemRowStart = Number(selectedItem.style.gridRowStart) || 1
                itemRowEnd = Number(selectedItem.style.gridRowEnd) || 2

                    // console.log("END", selectedItem.style.gridColumEnd, selectedItem.style.gridRowEnd)
            }
            return{
                oninit:()=> updateGridState(),
                onupdate:()=> updateGridState(),
                view:()=> {
                    return [
                        m(".item", {
                            onclick:()=>{
                                if(isGrid) selectedItem.style.display = null
                                else selectedItem.style.display = "grid"
                                isGrid = !isGrid
                            }
                        },[
                            m("input",{
                                style: {marginRight: "1rem"},
                                type:"checkbox",
                                checked: isGrid ? true : false
                            }),
                            isGrid ? "Deshacer el grid" : "Convertir en grid"
                        ]),
                        isGrid ? [
                            m(".item",
                                m("div", {
                                    style: {display: "flex",alignItems: "center", justifyContent: "space-between",margin: "10px 0"}
                                }, [
                                    m("strong", "Columnas"),
                                    m("span",[
                                        m("i.minus.icon", {
                                            onclick:()=>{
                                                if(cols == 1) return
                                                cols -= 1;
                                                if(!isGrid) selectedItem.style.display = 'grid'
                                                selectedItem.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
                                            }
                                        }),
                                        m("i.plus.icon", {
                                            onclick:()=>{
                                                if(cols >= 16) return
                                                cols += 1;
                                                if(!isGrid) selectedItem.style.display = 'grid'
                                                selectedItem.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
                                            }
                                        })
                                    ]),
                                    cols,
                                ]),
                            ),
                            m(".item",
                                m("div", {
                                    style: {display: "flex",alignItems: "center", justifyContent: "space-between",margin: "10px 0"}
                                }, [
                                    m("strong", "Espacio"),
                                    m("span",[
                                        m("i.minus.icon", {
                                            onclick:()=>{
                                                if(gap == 0) return
                                                gap -= 1;
                                                if(!isGrid) selectedItem.style.display = 'grid'
                                                selectedItem.style.gap = gap + "rem";
                                            }
                                        }),
                                        m("i.plus.icon", {
                                            onclick:()=>{
                                                gap += 1;
                                                if(!isGrid) selectedItem.style.display = 'grid'
                                                selectedItem.style.gap = gap + "rem";
                                            }
                                        })
                                    ]),
                                    gap + "rem",
                                ]),
                            ),
                        ]
                        :null,
                        isParentGrid ? [
                            m(".item",[
                                m("p", [
                                    m("strong", "Modificar el tamaño"),
                                    m("span", {style: {float: "right"}},
                                        m(CleanStyleButton, {
                                            name: "gridArea",
                                        })
                                    )
                                ]),
                                //de arriba hacia abajo
                                m("a.ui.mini.button", {
                                    onclick:()=>{
                                        if(itemRowEnd > rowsLength)
                                            itemRowEnd = itemRowStart + 1
                                        else
                                            itemRowEnd += 1;

                                        selectedItem.style.gridRowStart =  itemRowStart
                                        selectedItem.style.gridRowEnd = itemRowEnd
                                    }
                                },m("i.arrows.alternate.vertical.icon")),
                                //de izquierda a derecha
                                m("a.ui.mini.button", {
                                    onclick:()=>{
                                        console.log("Cols", parentCols && itemColEnd > parentCols)
                                        console.log("Cols", itemColEnd)
                                        if(parentCols && itemColEnd > parentCols)
                                            itemColEnd = itemColStart + 1
                                        else
                                            itemColEnd += 1;
                                        selectedItem.style.gridColumnEnd = itemColEnd
                                        selectedItem.style.gridColumnStart =  itemColStart
                                    }
                                },m("i.arrows.alternate.horizontal.icon"))
                            ]),

                        ]
                        :null,
                        m(".item", {
                            onclick:()=>{
                                if(confirm("¿Deseas quitar tode del 'Grid?")){
                                    selectedItem.style.display = null;
                                    selectedItem.style.gridTemplateColumns = null   ;
                                    selectedItem.style.gridGap = null;
                                    selectedItem.style.gridArea = null;
                                }
                            }
                        },[ m("i.eraser.icon") , "Limpia todo del grid"])
                    ]
                }
            }
        }

        function SizeEditor(){
            return {
                view: () => {
                    return [
                        m(".item", [
                            m("p", m("strong" , "height")),
                            m(EditionStyleInput, {
                                name: "height",
                                placeholder: "auto"
                            }),
                        ]),
                        m(".item", [
                            m("p", m("strong" , "width")),
                            m(EditionStyleInput, {
                                name: "width",
                                placeholder: "auto"
                            })
                        ])
                    ]
                }
            }
        }

        return {
            // oninit:()=>{
            //     selected = selectedItem
            //     console.log("oninit", selected == selectedItem)
            // },
            // onbeforeupdate:()=>{
            //   //  selected = selectedItem
            //  //   tabMenu = false
            //  console.log("onbeforeupdate", selected == selectedItem)
            //  if(selected != selectedItem) {
            //     // tabMenu = false
            //     selected = selectedItem
            //  }
            // },
            view:()=>{
           // console.log("TAbMenu: ", tabMenu)
                const menus = {
                    BorderEditor: {svg:"border.white", name: "BorderEditor", title: "Edita el borde", component: m(BorderEditor)},
                    BackgroundEditor: {icon:"chess board icon", name: "BackgroundEditor", title: "Edita el background", component: m(BackgroundEditor)},
                    FontEditor: {icon:"font icon", name: "FontEditor", title: "Edita el fuente", component: m(FontEditor)},
                    // ColorEditor: {icon:"eye dropper icon", name: "ColorEditor", title: "Color del texto", component: m(ColorEditor)},
                    MarginEditor: {icon:"expand icon", name: "MarginEditor", title: "Edita el margin", component: m(MarginEditor)},
                    PaddingEditor: {icon:"compress icon", name: "PaddingEditor", title: "Edita el padding", component: m(PaddingEditor)},
                    CssGrid: {icon:"th icon", name: "CssGrid", title: "Edita el GRID", component: m(CssGrid)},
                    AlignEditor: {icon:"align left icon", name: "AlignEditor", title: "Alineación", component: m(AlignEditor)},
                    SizeEditor: {icon:"expand arrows alternate icon", name: "SizeEditor", title: "Edita el tamaño", component: m(SizeEditor)},
                }

                return [
                    m(".ui.big.icon.vertical.black.buttons", [
                        Object.keys(menus).map( key => {
                            return m(".ui.right.pointing.dropdown.icon.button", {
                                className: tabMenu == menus[key].name ? "active" : null,
                                onclick: () => {
                                    if(tabMenu == menus[key].name) tabMenu = null
                                    else tabMenu = menus[key].name
                                },
                                title: menus[key].title
                            }, [
                                menus[key].icon ? m("i", {className: menus[key].icon}) : null,
                                menus[key].svg ? m(SvgIcon,{icon: menus[key].svg}) : null,
                            ])
                        }),
                        //Resetear estilos
                        m(".ui.icon.button",{
                            title: "Resetear cambios",
                            //onclick:()=>document.execCommand('removeFormat', false, null)
                            onclick:()=>{
                                if(confirm('¿Quitar todo estilo del elemento seleccionado?')){
                                    selectedItem.style = null
                                }
                            }
                        },m("i.eraser.icon")),
                    ]),

                    tabMenu ? m(".ui.vertical.menu", {
                        style: {
                            position: "fixed",
                            top: "40px",
                            width: "330px",
                            right: "110px",
                        },
                        onclick: e => {
                            e.preventDefault()
                            e.stopPropagation()
                        }
                    }, [
                        m(ComponentTitle,{title: menus[tabMenu].title}),
                        menus[tabMenu].component,

                    ]):null,

                    modal
                    ? m(OpenAssetsManager, {
                        realm: getRealm(),
                        close: () => modal = false,
                        accept: (ids, col, full) => {
                            if (Array.isArray(full) && full.length)
                                updateStyle("backgroundImage", `url('${full[0].href}')`)
                            modal = false
                        },
                        limit: 1
                    })
                    : null
                ]
            }
        }
    }

    //  Muestra los posibles elementos que se pueden cargar un dato de datasource

}

function DataSourceElement() {
    const FIELDS = {
        title: {
            tag: "h1",
            component: "dv-simple",
            value: "${JSON.stringify($value)}"
        },
        entitiesGroup: {
            component: "dv-relacionados",
            value: "${JSON.stringify($value)}"
        },
        nodesGroup: {
            component: "dv-relacionados",
            value: "${JSON.stringify($value)}"
        },
        categories: {
            component: "dv-categories",
            value: "${JSON.stringify($value)}"
        },
        nodeTypes: {
            component: "dv-nodeTypes",
            value: "${JSON.stringify($value)}"
        },
        filesGroup: {
            component: "dv-filesgroup",
            value: "${JSON.stringify($value)}"
        },
        linksGroup: {
            component: "dv-links-group",
            value: "${JSON.stringify($value)}"
        },
        socialShare: {
            component: "dv-social-share",
            value: "${JSON.stringify($value)}"
        },
        headerImage: {
            component: "dv-headerImage",
            value: "${JSON.stringify($value)}"
        },
        images: {
            component: "dv-images",
            value: "${JSON.stringify($value)}"
        },
        telephones: {
            component: "dv-telephones",
            value: "${JSON.stringify($value)}",
            text: "phone"
        },
        faxes: {
            component: "dv-telephones",
            value: "${JSON.stringify($value)}",
            text: "fax"
        },
        emails: {
            component: "dv-telephones",
            value: "${JSON.stringify($value)}",
            text: "email"
        },
        address: {
            component: "dv-address",
            value: "${JSON.stringify($value)}"
        },
        period: {
            component: "dv-period",
            value: "${JSON.stringify($value)}"
        },
        coordinates: {
            component: "dv-coordinates",
            value: "${JSON.stringify($value)}"
        }
    }

    const REFS = {
        "#/definitions/Localized": "${getLocalized($value)}"

    }

    function Datasource() {
        let data
        let schema
        return {
            oninit: async ({attrs}) => {
                const { datasource } = attrs

                if (!datasource.url) return

                console.log("Datasource",datasource)
                data = await api_get(evaluate(datasource.url,{}, datasource.slots), "GET", null, {credentials: false})
                // if (datasource.schema) {
                //     let query = await api_get(`https://public.digitalvalue.es:8865/${getRealm()}/schemas?collectionName=${datasource.schema}`)
                //     if (Array.isArray(query) && query[0]) {
                //         if (query[0].docSchema)
                //             schema = query[0].docSchema

                //         ///console.log("SCHEMA", datasource.schema, schema)
                //     }
                // }
            },
            view: ({attrs}) => {
                const { datasource } = attrs

                if (!datasource)
                    return null

                return data
                    ? m(Tree, {
                        json: data,
                        callback: (path, name, value) => {
                            //console.log("TREE CALLBACK", path, name, value)

                            if (!name || !FIELDS[name])
                                return alert("COMPONENTE NO DECLARADO!")
                            let options = FIELDS[name]
                            let json = options.value.replace("$value", path)
                            let element
                            if (name && value) {

                               // let schemaDef = schema.properties[name]
                                let component = options.component || "dv-simple"
                                let tag = options.tag || null

                                let _value = typeof value === 'object' ? JSON.stringify(value) : value
                                //console.log("Datasource", component, path, name, value, json)
                                element = addElement(component, tag, options.text || value, {json})

                                if (component === "dv-simple")
                                    element.setAttribute("data-localized", _value)
                            }
                            else {
                                element = addElement("dv-simple", "p", json, {json})
                                //element.setAttribute("data-localized", _value)

                            }
                            m.redraw()
                            //renderPage(pageData)
                        },
                        level: 1,
                        name: datasource.name
                    })
                    : m(".ui.message", "No se obtuvieron datos de la consulta")
            }
        }
    }
    return {
        view:({attrs}) => {
            let datasources = pageData.datasources ? JSON.parse(pageData.datasources) : []

            //console.log(datasources)

            return m("div", {
                onclose: () => attrs.onclose(),
                style: {
                    overflow: "auto",
                    minWidth: "250px",
                    maxWidth: "500px",
                    maxHeight: "820px",
                    background: "#fff",
                    border: "1px solid #ddd",
                    //zIndex: 1001
                }
            }, [
                m("p", {style: "text-align: right;"}, m("i.red.close.icon", {
                    onclick: () => attrs.onclose(),
                    style: "cursor: pointer;"
                })),
                Array.isArray(datasources)
                ? m(".ui.segments",
                    datasources.map(datasource => m(".ui.segment", m(Datasource, {datasource})))
                )
                : null,
                // m(".ui.button", {
                //     onclick: () => {
                //         addElement("dv-simple", "p", "datasource")
                //         datasourcelement = false
                //     }
                // }, "Añadir")
            ])
        }
    }
}

function ImportSegment() {
    let plantillas = {},
        selectedWeb = null,
        selectedSegment = false;
    let html

    return {
        oninit:()=>{
            api_get(API + `${getRealm()}/collections/paginas/?or=templates=true|templates="true"`)
            .then(res => {
                plantillas = res
               // console.log('Plantillas', res)
                if(plantillas.items && plantillas.items.length > 0)
                    selectedWeb = plantillas.items[0]
            })
        },
        view: ({attrs})=> {
            if(!plantillas.items || !attrs.segment) {return ""}

            return m(Modal, {
                    close: ()=> attrs.onclose(),
                    top: "50px"
                }, m(".ui.grid.equal.width",{style: {height: "100%", margin: 0,minHeight: "70vh"}},[
                        m(".four.wide.column",{
                                style: {
                                    minWidth: "200px",
                                    padding: "1rem 0 0 1rem",
                                    background: "rgb(247 247 247)"
                                }
                            },
                            m(".ui.header.centered", "Páginas de plantillas"),
                            m(".ui.tabular.vertical.left.attached.menu",{
                                    style: {height: "90%", paddingTop: "1rem"}
                                },[
                                    plantillas.items.map( item => m(".item",{
                                                    key: item._id,
                                                    style: {
                                                        padding: "6px",
                                                        marginRight: selectedWeb == item ? "-2px" : null
                                                    },
                                                    onclick:(e)=>{
                                                        selectedSegment = null
                                                        selectedWeb = item
                                                    },
                                                    className: selectedWeb == item ? 'active' : null
                                                },
                                                m(".ui.small.header",{
                                                    style: {display: "flex",alignItems: "baseline"}
                                                },[
                                                    m(".content", [
                                                        item.name,
                                                        m(".sub.header",`[${item.web || 'Sin web'}] `),
                                                    ]),
                                                ])
                                            )

                                    )
                            ])
                        ),
                        m(".column",[
                            m(".ui.header.centered", "Componentes personalizados"),
                            m(".ui.equal.width.padded.grid",[
                                m(".column",
                                    selectedWeb
                                    ? m(".ui.small.divided.list",[
                                        selectedWeb.segments.map(s =>{
                                            if (!s.name) return ""
                                            return m(".item.ui.small.basic.buttons", {
                                                    className: selectedSegment == s ? "green" : null,
                                                    style:{
                                                        border: "1px solid #ddd",
                                                        marginBottom: "5px",
                                                    }
                                                },[
                                                    m("a.ui.button", {
                                                        style: {
                                                            textAlign: "left",
                                                            width: "calc(100% - 37px)"
                                                        },
                                                        onclick: async ()=> {
                                                            html=await segment_toHTML(s)
                                                            selectedSegment = s
                                                        }
                                                    }, s.name),
                                                    m("a.ui.icon.button", {
                                                        style: {float: "right"},
                                                    },m("i.chevron.right.icon"))
                                                ])
                                        })
                                    ])
                                    : null,
                                ),
                                m(".column",
                                    selectedSegment
                                    ? m(".ui.segments", [
                                        m(".ui.inverted.blue.segment",
                                            m(".ui.small.header.centered", selectedSegment.name)
                                        ),
                                        m(".ui.segment", [
                                            selectedSegment.thumbnail
                                            ? m(".ui.image", m("img", {src: selectedSegment.thumbnail}))
                                            : m("p", "no tiene imagen asignada"),
                                        ]),
                                        m(".ui.bottom.segment",
                                            m(".ui.fluid.buttons",{
                                                style: {marginTop: "auto"},
                                                }, [
                                                    m("button.labeled.ui.button.icon", {
                                                        onclick: (e)=>{
                                                            attrs.onclose();
                                                            importSegment(selectedWeb._id, selectedSegment.name)
                                                        }
                                                    },"Paste", m("i.download.icon")),
                                                    m("button.labeled.ui.positive.button.icon", {
                                                        onclick: (e)=>{
                                                            attrs.onclose();
                                                            //console.log("Selected item: ",selectedItem)
                                                            referSegment(selectedWeb._id, selectedSegment)
                                                        }
                                                    },"Referencia",m("i.linkify.icon"))
                                                ])
                                        ),
                                    ])
                                    :null
                                )
                            ]),

                            html
                            ? m(".ui.row.container",m.trust(html))
                            : null

                        ]),
                    ])

                )
        }
    }
}

function ComponentsList(){
    const htmlComponentes =  [
        {title: "Párrafo", onclick:()=>addElement("dv-simple", "p", ""), icon: "paragraph green", extra: "Añadir párrafo"},
        {title: "Enlace", onclick:()=>addElement("dv-simple", "a", ""), icon: "linkify blue", extra: "Añadir enlace"},
        {title: "Imagen", onclick:()=>addElement("dv-simple", "img", ""), icon: "image red", extra: "Añadir imagen"},
        {title: "Botón", onclick:()=>addElement("dv-simple", "button", ""), icon: "ticket alternate green", extra: "Añadir botón html <button>"},
        {title: "Divider", onclick:()=>addElement("dv-simple", "hr", ""), icon: "minus grey", extra: "Barra gris que separa los elementos (ui divider)"},
        {title: "Video", onclick:()=>addElement("dv-simple", "video", ""), icon: "film black", extra: "<video> Añadir video"},
        {title: "Cabecera H1", onclick:()=>addElement("dv-simple", "h1", ""),icon:"heading purple", extra: "Etiqueta <h1>"},
        {title: "Cabecera H2", onclick:()=>addElement("dv-simple", "h2", ""),icon:"heading purple", extra: "Etiqueta <h2>"},
        {title: "Cabecera H3", onclick:()=>addElement("dv-simple", "h3", ""),icon:"heading purple", extra: "Etiqueta <h3>"},
        {title: "Cabecera H4", onclick:()=>addElement("dv-simple", "h4", ""),icon:"heading purple", extra: "Etiqueta <h4>"},
        {title: "Cabecera H5", onclick:()=>addElement("dv-simple", "h5", ""),icon:"heading purple", extra: "Etiqueta <h5>"},
        {title: "Cabecera H6", onclick:()=>addElement("dv-simple", "h6", ""),icon:"heading purple", extra: "Etiqueta <h6>"},
        {title: "Dv-Simple", onclick:()=>addElement("dv-simple", "div" , ""), icon: "archive green", description: "Div simple configurable", extra: "Crea un componente vacio totalmente configurable."},
        {title: "Icon", onclick:()=>addElement("dv-simple", "i", ""), icon: "puzzle piece violet", extra: "Añadir icono de semantic ui"},
        {title: "Lista", icon: "list ul", extra: "Añadir lista no ordenada", onclick:()=>{
            const element = segment_render("",{
                "tag": "ul",
                "style": "padding: 1rem;",
                "className": "ui list",
                "components": [
                    {
                    "name": "dv-simple",
                    "type": "component",
                    "className": "ui item",
                    "tag": "li",
                    "value": "Elemento 1"
                    },
                    {
                    "name": "dv-simple",
                    "type": "component",
                    "className": "ui item",
                    "tag": "li",
                    "value": "Elemento 2"
                    },
                ]
                })
            $(selectedItem).append(element);
        }},
        {title: "Lista", icon: "list ol", extra: "Añadir lista  ordenada", onclick:()=>{
            const element = segment_render("",{
                "tag": "ol",
                "style": "padding: 1rem;",
                "className": "ui list",
                "components": [
                    {
                    "name": "dv-simple",
                    "type": "component",
                    "className": "ui item",
                    "tag": "li",
                    "value": "Elemento 1"
                    },
                    {
                    "name": "dv-simple",
                    "type": "component",
                    "className": "ui item",
                    "tag": "li",
                    "value": "Elemento 2"
                    },
                ]
                })
            $(selectedItem).append(element);
        }},
    ]

    const otrosComponentes =  [
        {title: "Accordeón", onclick:()=>addElement("dv-accordion", "p", ""), icon: "caret square down outline", description: "Añadir accordeón"},
        {title: "Encuestas Enlazadas", onclick:()=>addElement("dv-encuestas", "p", ""),icon:"question circle outline", description: "Añadir Encuestas Enlazadas"},
        {title: "Organigrama en Columnas", onclick:()=>addElement("dv-organigrama-columnas", "h6", ""),icon:"sitemap red", description: "Añadir Organigrama en Columnas"},
        {title: "Visor Presupuestario", onclick:()=>addElement("dv-visor-presupuestario", "p", ""),icon:"plus circle", description: "Añadir Visor Presupuestario"},
        {title: "Visor Presupuestario 2", onclick:()=>addElement("dv-informe-ita", "p", ""),icon:"plus circle", description: "Añadir Visor Presupuestario'"},
        {title: "Mapa de Farmacias", onclick:()=>addElement("dv-visor-presupuestario", "p", ""),icon:"medkit", description: "Añadir Mapa de Farmacias"},
        {title: "Compartir en Redes Sociales", onclick:()=>addElement("dv-share-on-social-networks", "p", ""),icon:"twitter", description: "Añadir Compartir en Redes Sociales"},
    ]
    const zityComponents = [
        {title: "Data Source", onclick:()=>addElement("dv-datasource"), icon: "database brown", description: "Data Source", extra: "Componente que permite cargar datos que se utilizarán posteriormente para pintar la página."},
        {title: "Dv-Simple", onclick:()=>addElement("dv-simple", "div" , ""), icon: "archive green", description: "Div simple configurable", extra: "Crea un componente vacio totalmente configurable."},
        {title: "Input de búsqueda", onclick:()=>addElement("dv-busqueda"), icon: "search black", description: "Input de Búsqueda", extra: "Genera un input de búsqueda."},
        {title: "Barra de Idioma", onclick:()=>addElement("dv-idiomas"), icon: "search black", description: "Barra de Idioma", extra: "Inserta una barra de idiomas."},
        {title: "Formulario", onclick:()=>addElement("dv-form"), icon: "wpforms grey", description: "Formulario", extra: "Genera un formulario."},
        {title: "Carrousel", onclick:()=>addElement("dv-carrousel"), icon: "images purple", description: "Carrousel", extra: "Genera un carrousel de con imágenes u otro tipo de contenido."},
        {title: "Parallax", onclick:()=>addElement("dv-parallax"), icon: "images violet", description: "Añadir parallax", extra: "Inserta un component cuyo contenido se visualizará en movimiento."},
        {title: "Galeria de fotos", onclick:()=>addElement("dv-galeria"), icon: "images orange", description: "Añadir galería photoSwipe", extra: "Añade una galeria de fotos."},
        {title: "Añadir galería ZITY", onclick:()=>addElement("dv-zity-galeria"), icon: "images orange", description: "Añadir galería ZITY", extra: "ZITY GALERIA."},
        {title: "Imagen con efecto Ken Burns", onclick:()=>addElement("dv-kenBurns"), icon: "images orange", description: "Añadir foto con efecto Ken Burns", extra: "Añade una imagen con efecto Ken Burns."},
        {title: "Nuevo Menú", onclick:()=>addElement("dv-menu"), icon: "bars blue", description: "Menú", extra: "Crea un menu desplegable."},
        {title: "Organigrama", onclick:()=>addElement("dv-organigrama"), icon: "sitemap black", description: "Organigrama", extra: "Genera un menú de organigrama."},
        {title: "Tabla de datos", onclick:()=>addElement("dv-table"), icon: "table grey", description: "Añadir tabla de datos", extra: "Genera una tabla de datos personalizable."},
        {title: "Mapa", onclick:()=>addElement("dv-mapa"), icon: "map green", description: "Mapa", extra: "Inserta un mapa 'leaflet' configurable."},
        {title: "Calendario", onclick:()=>addElement("dv-calendar"), icon: "map green", description: "Añadir Calendario", extra: "Crea un calendario 'Fullcalendar'."},
        {title: "Agenda", onclick:()=>addElement("dv-agenda"), icon: "tasks alternate blue", description: "Añadir Agenda", extra: "Genera una agenda de eventos."},
        {title: "Carrito", onclick:()=>addElement("dv-carrito", "div", ""), icon: "shopping cart green", description: "Carrito", extra: "Añade un carrito de la compra."},
        {title: "Botón para producto del carrito", onclick:()=>addElement("dv-botoncarrito", "div", ""), icon: "cart arrow down green", description: "Botón para producto del carrito", extra: "Añade un botón para añadir producto al carrito."},
        {title: "Calculadora presupuestaria", onclick:()=>addElement("dv-calculadora-presupuestaria"), icon: "calculator black", description: "Calculadora presupuestaria", extra: "Genera una calculadora prosupuestaria."},
        {title: "Encuesta", onclick:()=>addElement("dv-encuesta"), icon: "question blue", description: "Encuesta", extra: "Añade una encuesta."},
        {title: "Grupo encuestas", onclick:()=>addElement("dv-grupoencuestas"), icon: "question circle blue", description: "Grupo encuestas", extra: "Añade un grupo de encuestas."},
        {title: "Directorio", onclick:()=>addElement("dv-directorio"), icon: "map outline green", description: "Directorio", extra: "Genera un mapa directorio de localizaciones."},
        {title: "Accesibilidad", onclick:()=>addElement("dv-accessibility"), icon: "universal access circle blue", description: "Accesibilidad", extra: "Añade un panel y funcionalidades de accesibilidad a la página web."},
        {title: "Botón Me Gusta", onclick:()=>addElement("dv-megusta"), icon: "thumbs up circle blue", description: "Me gusta"},
    ]

    const graphComponents = [
        {title: "Barras", onclick:()=>addElement("dv-graph", "bars"),icon:"chart line", description: "Gráfica de barras"},
        {title: "Barras múltiples", onclick:()=>addElement("dv-graph", "multiBars"),icon:"chart line", description: "Gráfica de barras múltiple"},
        {title: "Barras apiladas", onclick:()=>addElement("dv-graph", "stackedBars"),icon:"chart line", description: "Gráfica de barras apiladas"},
        {title: "Lineas", onclick:()=>addElement("dv-graph", "lines"), icon:"chart line",description: "Gráfica de líneas"},
        {title: "Burbujas", onclick:()=>addElement("dv-graph", "bubbles"),icon:"chart line", description: "Gráfica de burbujas"},
        {title: "Circular", onclick:()=>addElement("dv-graph", "circular"),icon:"chart line", description: "Diagrama de círculos"},
        {title: "Barras horizontales", onclick:()=>addElement("dv-graph", "horizontalBars"),icon:"chart line", description: "Gráfica de barras horizontales"},
        {title: "Barras horizontales múltiples", onclick:()=>addElement("dv-graph", "multiHorizontalBars"),icon:"chart line", description: "Gráfica de barras horizontales múltiples"},
        {title: "Pila horizontal", onclick:()=>addElement("dv-graph", "horizontalStack"),icon:"chart line", description: "Gráfica de pila horizontal"},
        {title: "Barras apiladas", onclick:()=>addElement("dv-graph", "stackedBars"),icon:"chart line", description: "Gráfica de barras apiladas"},
        {title: "Barras apiladas horizontales", onclick:()=>addElement("dv-graph", "stackedHorizontalBars"), icon:"chart line",description: "Gráfica de barras apiladas horizontales"},
        {title: "Sunburst", onclick:()=>addElement("dv-graph", "sunburst"), icon:"chart line",description: "Gráfica de sunburst"},
        {title: "Treemap", onclick:()=>addElement("dv-graph", "treemap"), icon:"chart line",description: "Gráfica de treemap"},
        {title: "Particiones", onclick:()=>addElement("dv-graph", "partition"),icon:"chart line", description: "Gráfica de particiones"},
        {title: "Mapa interactivo", onclick:()=>addElement("dv-graph", "interactiveMap"),icon:"chart line", description: "Mapa interactivo"},
        {title: "Mapa de calor", onclick:()=>addElement("dv-graph", "heatMap"),icon:"chart line", description: "Mapa de calor"},
        {title: "Burbujas", onclick:()=>addElement("dv-graph", "bubble"),icon:"chart line", description: "Gráfica de burbujas"},
        {title: "Burbujas anidadas", onclick:()=>addElement("dv-graph", "zoomableBubble"),icon:"chart line", description: "Gráfica de burbujas anidadas"},
        {title: "Calendario de actividad", onclick:()=>addElement("dv-graph", "calendarHeatMap"),icon:"chart line",description: "Calandario de actividad"},
        {title: "Medidor", onclick:()=>addElement("dv-graph", "gauge"),icon:"chart line",description: "Gráfica de medidor"},
        {title: "Medidor multiple", onclick:()=>addElement("dv-graph", "multiGauge"),icon:"chart line", description: "Gráfica de medidor multiple"},
        {title: "Leyenda de grafico", onclick:()=>addElement("dv-graphLegend"),icon:"chart line", description: "Leyenda de grafico"},
    ]

    const dataSourceComponents = [
        {title: "Telephones", onclick:()=>addElement("dv-telephones","div", "phone"), icon: "phone"},
        {title: "Faxes", onclick:()=>addElement("dv-telephones","div",  "fax"), icon: "fax"},
        {title: "Emails", onclick:()=>addElement("dv-telephones","div", "email"), extra: "Correos electrónicos", icon: "envelope outline"},
        {title: "Period", onclick:()=>addElement("dv-period","div", ""), extra: "Rango de Fechas ( period )", icon: "clock outline"},
        {title: "Links", onclick:()=>addElement("dv-links","div", ""), extra: "WebLinks, Links", icon: "reply"},
        {title: "LinksGroup", onclick:()=>addElement("dv-links-group","div", ""), extra: "Grupo de WebLinks, Links", icon: "reply all"},
        {title: "SocialShare", onclick:()=>addElement("dv-social-share","div", ""), extra: "Redes Sociales", icon: "users"},
        {title: "Address", onclick:()=>addElement("dv-address","div", ""), extra: "Direcciones (calle, municipio, cp)", icon: "map signs"},
        {title: "HeaderImage", onclick:()=>addElement("dv-headerImage","div", ""), extra: "Imagen de un Articulo | Entidad", icon: "image"},
        {title: "Images", onclick:()=>addElement("dv-images","div", ""), extra: "Galeria de imágenes", icon: "images"},
        {title: "Files", onclick:()=>addElement("dv-files","div", ""), extra: "Ficheros (docs, pdf's, images)", icon: "file outline"},
        {title: "FilesGroup", onclick:()=>addElement("dv-filesgroup","div", ""), extra: "Grupo de Ficheros (docs, pdf's, images)", icon: "copy outline"},
        {title: "Relacionados Entidades", onclick:()=>addElement("dv-relacionados","div", "entitiesGroup"), extra: "Entidades relacionados", icon: "sitemap"},
        {title: "Relacionados Articulos", onclick:()=>addElement("dv-relacionados","div", "nodesGroup"), extra: "Articulos relacionados", icon: "sitemap"},
        {title: "Code", onclick:()=>addElement("dv-code","div", ""), extra: "Componente con código JS", icon: "js"},
        {title: "Component M", onclick:()=>addElement("dv-component-m","div", ""), extra: "Componente programado con Mithril JS", icon: "js"},
        {title: "Mapa de Asociaciones", onclick:()=>addElement("dv-mapa-asociaciones", "p", ""), icon:"map outline red", description: "Añadir Mapa de Asociaciones"},
        {title: "Agenda Calendario", onclick:()=>addElement("dv-agenda-calendario", "p", ""),icon:"calendar alternate outline", description: "Añadir Agenda Calendario"},
        {title: "Categories", onclick:()=>addElement("dv-categories","div", ""), extra: "Categorias de un articulo | entidad", icon: "bookmark outline"},
        {title: "NodeTypes", onclick:()=>addElement("dv-nodeTypes","div", ""), extra: "Tipos de un articulo | entidad", icon: "bookmark"},
        {title: "Prevista del Articulo", onclick:()=>addElement("dv-prevista-articulo","div", ""), description: "Añadir Prevista del Articulo", icon: "id card outline"},
        {title: "Noticia", onclick:()=>addElement("dv-noticia","div", ""), description: "Añadir Noticia", icon: "newspaper outline"},
        {title: "Buscador Tramites", onclick:()=>addElement("dv-buscador-sede-electronica","div", ""), extra: "Añadir Buscador de tramites para Sede Electrónica", icon: "search"},
    ]

    let menu = [
        "Componentes Zity",
        "Componentes HTML",
        "Componentes DataSorce",
        "Gráficas",
        "Otros Componentes",
        ],
        tab = 0
    return{
        view: ({attrs})=>m(Modal,{
                    onclose:()=> attrs.onclose(),
                },
                m(".ui.grid",{style: {padding: "5px",margin:0}},
                    m(".four.wide.column",
                        m(".ui.tabular.vertical.fluid.menu",{style: {height: "65vh"}},[
                            menu.map( (item, i) => m(".item", {
                                className: tab == i ? "active" : null,
                                style: {marginBottom:  tab == i ? "-2px" : null},
                                onclick: ()=> tab = i
                            }, item))
                        ])
                    ),
                    m(".twelve.wide.stretched.column",{style: {height: "65vh",overflow: "auto"}},
                        m(".ui.two.column.vertically.divided.grid",[
                            tab == 0 ? zityComponents.map( item => m(".column", m(ListItem, {item: item,  callback: attrs.onclose}))) : null,
                            tab == 1 ? htmlComponentes.map( item => m(".column",m(ListItem, {item: item,  callback: attrs.onclose}))) : null,
                            tab == 2 ? dataSourceComponents.map( item => m(".column", m(ListItem, {item: item,  callback: attrs.onclose}))) : null,
                            tab == 3 ? graphComponents.map( item => m(".column", m(ListItem, {item: item, callback: attrs.onclose}))) : null,
                            tab == 4 ? otrosComponentes.map( item => m(".column",m(ListItem, {item: item, callback: attrs.onclose}))): null,
                        ])
                    )
                ))
    }
} 

function ListItem() {
    return {
        view: ({attrs})=>{
            const { title, icon, onclick, description, extra } = attrs.item
            const {callback} = attrs
            return [
                m("a", {
                        className: attrs.className,
                        style: {cursor: "pointer"},
                        title: description,
                        onclick: ()=>{
                            onclick();
                            if(callback && typeof callback == "function")
                                callback()
                        },
                    },[
                        icon ? m("i.icon", {className: icon}) : null,
                        title
                ]),
                extra ? m("p", extra) : null
            ]
        }
    }
}

// !!!! Hacer que la función Preview abra una página que se pueda recargar para ver los cambios,
// incluso automáticamente conforme se trabaja en el editor
// !!! PERMITIR NAVEGAR

function Preview() {
    let selected =  0,
        downMenu = false;

    const previews = [
        {title: "Simple HTML", onclick: ()=>{mostrarHTML2()}, icon: "desktop alternate", description: "Ver la página actual en nueva pestaña"},
        {title: "Móvil", onclick: ()=>{mostrarHTMLMovil()}, icon: "mobile alternate", description: "Ver la página actual en versión movil"},
        {title: "Servidor", onclick: ()=>{mostrarHTML()}, icon: "server alternate", description: "Ejecutar en Servidor port:8802"}
    ]

    return {
        view:()=>[
            // m(".ui.compact.inverted.menu",
            //     m(".ui.simple.item.dropdown",{style: {padding: "0px 1rem"}},
            //         m("span.title","Ver página"),
            //         m("i.desktop.icon",{
            //             onclick:()=>previews[selected].onclick(), // !! un poco enrevesado
            //             style: {marginLeft: "10px"}
            //         }),
            //         m(".menu", [
            //             previews.map( (item,i) => m(ListItem,{item, className: `${i===selected ? 'active' : ''} item`})
            //             ),
            //         ]))
            // )
            m(".ui.blue.buttons",[
                m(".ui.button",{
                    style: {borderRadius: 0},
                    onclick: () => previews[selected].onclick()
                }, "Ver página"),
                m(".ui.dropdown.icon.button",{
                    style: {borderRadius: 0},
                    tabindex: 0,
                    onclick:()=> downMenu = !downMenu,
                    onblur:()=> downMenu = false
                },[
                    m("i.icon", {className: previews[selected].icon}),
                    m("i.caret.down.icon"),
                    downMenu ? m(".vertical.menu.visible", {
                        style: "display:block;min-width:150px;"},[
                        //previews.map( (item,i) => m(ListItem,{item, className: `${i===selected ? 'active' : ''} item`})),
                        previews.map( (item,i) => m("a.item",{
                            title: item.title,
                            key: item.title,
                            onclick:(e)=> {
                                selected = i
                                previews[selected].onclick()
                            }
                        },[
                            item.title,
                            " ",
                            m("i.icon",{
                                className: item.icon,
                                style:{margin: 0,float:'right'}})
                        ])),
                    ])
                    :null
                ])

            ])
        ]
    }

    // // Para mostrar miniaturas de la página. No se utiliza
    // function Thumbnail() {
    //     const scale=0.25
    //     let html
    //     return {
    //         oninit:()=>{
    //             if (!pageData._id) {
    //                 viewMainMessage("error", "<p>Esta página no tiene ID. Guárdala como Nueva.</p>");
    //                 return;
    //             }
    //             page_toHTML(pageData, getRealm(), {})
    //             .then(res=>html=res)
    //         },
    //         view:()=>{
    //             return m("iframe",{
    //                 style:`width:100%;height:100%;border:0;transform:scale(${scale})`,
    //                 srcdoc:html
    //             })
    //         }
    //     }
    // }

    function mostrarHTMLMovil() {
        if (!pageData._id) {
            viewMainMessage("error", "<p>Esta página no tiene ID. Guárdala como Nueva.</p>");
            return;
        }

        let options="menubar=0,status=0,toolbar=0,location=0,width=375,height=812,modal=true"

       // console.log(options)
        try {
            //http://nodejs04.digitalvalue.es:8800
            if (pageData.name) window.open(WEB + `/${getRealm()}/${normalizar(pageData.name)}`, '', options);
            else window.open(WEB + `/${getRealm()}/page/${pageData._id}`, '', options);
        } catch (e) {
            console.log(e)
        }
    }


    // Muestra la página a través del servidor
    function mostrarHTML() {
        if (!pageData._id) {
            viewMainMessage("error", "Esta página no tiene ID. Guárdala como Nueva.");
            return;
        }

        try {
            //http://nodejs04.digitalvalue.es:8800
            if (pageData.name) window.open(WEB + `/${getRealm()}/${normalizar(pageData.name)}`, '');
            else window.open(WEB + `/${getRealm()}/page/${pageData._id}`, '');
        } catch (e) {
            console.log(e)
        }
    }

    // Muestra la página en local. Revisar para que funcione siempre
    function mostrarHTML2() {

        // Vamos a crear la función para manejar los mensajes desde la ventana de visualiación
      
        // postMessage
        // window.addEventListener("message",function(e) {
        // //   console.log('origin: ', e.origin)
        // //   // Check if origin is proper
        // //   if( e.origin !== 'http://localhost' ){ return }
      
        //   console.log('parent received message!: ', e.data);
        // }, false);

        pageData.errors=[]    
        pageData.segments = segment_toJson(document.getElementById("main")); // Para que aplique los últimos cambios
        //var context = pageData.context || {};

        page_toHTML(pageData, getRealm(), pageData.context || {})
        .then(function(html) {
           // console.log('html', html)
            var page = window.open('', 'PREVISUALIZACIÓN PÁGINA')
            page.document.write(html)
            page.document.close()

            // let controls=`
            // import 'https://components.digitalvalue.es/lib/mithril.min.js'
            // function Controles() {
            //     return {
            //         view: ()=>[
            //             m(".ui.icons",{style:"position:absolute:right:10;top:10"},[
            //                 m("i.ui.redo.icon"),
            //                 m("i.ui.desktop.icon"),
            //                 m("i.ui.redo.icon"),
            //             ]),
            //             m("#log")
            //         ]
            //     }
            // }

            // var aux = document.createElement("div")
            // aux.setAttribute("id","preview-controls")
            // document.body.appendChild(aux)

            // m.mount(document.getElementById('preview-controls'),{view:()=>m(Controles)})

            // var old = console.log;
            // var logger = document.getElementById('log');
            // if (logger) console.log = function (message) {
            //     if (typeof message == 'object') {
            //         logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : message) + '<br />';
            //     } else {
            //         logger.innerHTML += message + '<br />';
            //     }
            // }

            // //console.log(document.getElementById('main'))
            // console.log(document)
            // `

            // var head = page.document.getElementsByTagName('head')[0]
            // var script = page.document.createElement('script')
            // script.type = 'module'
            // // script.innerHTML = controls
            // script.addEventListener('error', e => reject(e.error))
            // head.appendChild(script)

            // !!! este código se repite en cargarPagina
            /// !!! hay que ponerlo en un solo sitio

            catchLinks(page.document, (uri) =>{
                cargarPagina({uri, edition:0, target:page})
            })

            page.dispatchEvent(new Event('DOMContentLoaded'));

            //console.log("MostrarHTML2",window.AAA,window.BBB,window)
        });
    }
}

// Convertir argumentos a objeto
async function cargarPagina({uri, id, edition = 1, target = window}) {
    //let pagina = await doAjax(API + 'api.php');
    //console.log("cargarpagina");

    showPageLoader();
    let query
    let parts
    let hash

    if (uri) {
        let pages = await readPages(getRealm()) // debe estar cacheadi 

        hash=uri.split('#') 
        query=hash[0].split('?') 
        parts=query[0].split('/')
        let end=parts[parts.length-1]
    
        // /// !!! !intentar cargar mas información: decorators, query ....
        // let decorators=parts
        // if (query[1]) context.query = query[1] 
    
        //console.log("CLICK",uri,parts,pages);

        if (pages[end]) {
            id=end
        }
        else {
            let find=Object.entries(pages).find(([_,name])=>name===end)
            //console.log(find)
            if (find) {
                console.log(find)
                id=find[0]
            }    
        }

        if (!id) return "NO EXISTE LA PAGINA"
    }

    return doAjax(API + getRealm() + "/collections/paginas/" + id)
        .then(function(res) {
            if (res) {
                pageData = res;
                //$("#apiListModal").modal("hide");
                document.getElementById("web-title").innerHTML = `
                <span>${pageData.web || 'Sin Web'}</span>
                <h2>${pageData.name}</h2>`;
            
                pageData.realm = getRealm()

                if(!pageData.context)
                    pageData.context = {}

                var context = pageData.context
                context.id=id

                if (parts) context.decorators=parts
                if (query && query[1]) context.query=query[1]     

                if (edition) {
                    window.history.pushState(pageData, 'PAGINA HISTORY', '?' + res._id);
                    return renderPage(res);
                } else{
                    loadDependencies(); // carga las dependencias de la página y de la web

                    console.log(context)
                    return page_toHTML(pageData, getRealm(), context)
                    .then(function(html) {
                        target.document.getElementById("main").innerHTML = html;
                        // cambiamos los links para singlepage app
                        catchLinks(target.document, function(uri) { cargarPagina({uri, edition:0, target}); });
                    });
            
                }
            } else {
                console.log("ERROR cargarPagina", id);
                return renderPage(templates["empty"]);


                
            }

        });
}

/* Crea una página nueva a partir de un array de segmentos */
function newPage(page, web = "") {
    if (templates[page]) {
        pageData = templates[page];
        if(web)
            pageData.web = web
        // console.log('PageData - WEB: ', web)
        // console.log('PageData: ', pageData)
        renderPage(pageData);
        savePage(API + getRealm() + "/collections/paginas", "POST")
    }
}

function savePage(url, method = "POST") {
    var nodo = document.getElementById('main').children;
    var segments = segment_toJson(nodo);
    pageData['segments'] = segments;

    var serverData = pageData;

    if(localStorage.user){
        serverData.modificatedBy = localStorage.user;
        serverData.lastModificate = new Date().toISOString()
    }

    // Marcamos la página para que se limpien las caches
    pageData.flushcache=true

    if (serverData._id && method === "POST")
        delete serverData._id;

    if (!serverData.owners || serverData.owners.lenght < 1) {
        serverData.owners = new Array;
        serverData.owners.push(USERDATA._id);
    }
    //console.log('Save New Page: ', serverData )
    doAjax(url, method, "json", serverData)
        .then(function(data) {
            if (data) {
                //console.log("[savePage]", "data", data, "pageData", pageData)

                pageData = data;
                viewMainMessage("positive", "¡Guardado!");
                // renderPage(pageData); // !!! se guarda dos veces pageData???
            } else {
                viewMainMessage("error", "Error en la conexión");
            }
        });

    //$('#saveDataModal').modal('hide');
}

function SegmentEditionMenu() {
    let selected,
        type,
        referenceItem = false,
        addNote=false,
        selectedName,
        isSection = false,
        // onHover = "add-container",
        componentmenu,
        dropdownMenu = false,
        visible = true, // Para panel secundario de segmentos
        editorMenu = 1;

    function SelectedElementEditorBar() {
        let pos = {},
            thisDom;

        function corectPosition(){
            const zoom = localStorage.zoom || 1
            const rect = selected.getBoundingClientRect();
            const parentW = selected.parentNode.clientWidth * zoom;
            let w = rect.width * zoom;
            if(w > parentW){
                w = parentW
            }
            const x = rect.x * zoom;
            const y = (rect.y  * zoom);
            pos.w = w + 4;
            pos.x = x - 2;
            pos.y = y - 44;
            pos.h = rect.height
            
            thisDom.style.left = pos.x + "px";
            thisDom.style.top = pos.y + "px";
            thisDom.style.width = pos.w + "px";

        }

        return {
            oncreate:(vnode)=>{
                thisDom = vnode.dom;
                corectPosition();
                window.addEventListener('resize', corectPosition);
                window.addEventListener('scroll', corectPosition);
            },
            onremove:()=>{
                window.removeEventListener('resize', corectPosition);
                window.removeEventListener('scroll', corectPosition);
            },
            onbeforeupdate: (vnode)=>{
                corectPosition();
            },
            view: (vnode) => {
                let background;
                if(type == 'component')
                    background = "#86b9ef"
                else if(isSection)
                    background = "#86efac"
                else if(selected.hasAttribute("data-ref")) 
                    background = "#c786ef"
                else 
                    background = "#ef8686"
                return (
                    m("#segment-controll", { 
                        onclick: (e)=>{e.stopPropagation()},
                        style: {
                            position: "fixed",
                            // zIndex: 997,
                            display: "flex",
                            justifyContent: "end",
                            padding: "4px 0px 4px 4px",
                            background: background,
                            borderRadius: "5px 5px 0 0",
                            minWidth: "475px"
                        }
                    }, [
                        type == "component" && m( ComponentEditor ),
                        type == "segment" &&  m( SegmentEditor )
                    ])
                )
            }
        }

        function ComponentEditor() {
            let contextMenu = false;
            return {
                view: () => {
                    return [
                        [
                            { text: selectedName, icon: "paint brush", style: { marginRight: "auto" }},
                            { onclick: ()=> openDefaultModal("javascript","stringify"), icon: "info" },
                            { onclick: ()=> upToParent(), icon: "angle double up", disabled: isSection },
                            { onclick: () => cloneElement(selectedItem), icon: "clone outline" },
                            { onclick: ()=> deleteElement(selectedItem), icon: "trash alternate outline" },
                            { onclick: ()=> contextMenu = !contextMenu, onblur: () => contextMenu = false, icon: "ellipsis vertical", children:  contextMenu && m(DropdownMenu) },            
                            { onclick: ()=> unselectItem(), icon: "close" },                
                        ].map( item => (
                            m(ButtonEdition, { ...item }, item.children )
                        )),

                        //m(".ui.small.basic.buttons",[
                        //    componentmenu && m.trust(componentmenu),
                        //]),
                    ]
                }
            }
        }

        function SegmentEditor() {
            let contextMenu = false;
    
            return {
                view: ({attrs}) => {
                    return [
                        [
                            { onclick: ()=> { addContainerOutside(); type = null }, icon: "plus", text: "WRAP" },
                            { onclick: ()=> addContainer(selectedItem, "inside"), icon: "plus", style: {marginRight: "auto"}, text: "INSIDE" },
                            { onclick: ()=> openDefaultModal("javascript","stringify"), icon: "info" },
                            { onclick: ()=> upToParent(), icon: "angle double up", disabled: isSection },
                            { onclick: () => cloneElement(selectedItem), icon: "clone outline" },
                            { onclick: ()=> deleteElement(selectedItem), icon: "trash alternate outline" },
                            { onclick: ()=> contextMenu = !contextMenu, onblur: () => contextMenu = false, icon: "ellipsis vertical", children:  contextMenu && m(DropdownMenu) },            
                            { onclick: ()=> unselectItem(), icon: "close" },                
                        ].map( item => (
                            m(ButtonEdition, { ...item }, item.children )
                        )),
                        isSection && [
                            m(AddSection, { 
                                insert: "beforebegin"
                            }),
                            m(AddSection, { 
                                insert: "afterend",
                                bottom: true 
                            })
                        ]
                    ]
                }
            }
    
            function AddSection() {
                let sectionDom,
                    addNewContainerSelector = false,
                    isBottom,
                    insertPosition;
    
                function fixPosition() {
                    const zoom = localStorage.zoom || 1
                    const rect = selected.getBoundingClientRect();
                    if(isBottom)
                        sectionDom.style.top = `${rect.height * zoom + 44}px`;
                    else{
                        sectionDom.style.bottom = "0px";
                    }
                }
    
                let shadowSection;
    
                const chooseContent = ( fr ) => {
                    addChildren(shadowSection, fr);
                    addNewContainerSelector = null;
                }
    
                const addSection = ( insert ) => {
                    
                    addNewContainerSelector = !addNewContainerSelector;
                    insertPosition = insert;
    
                    if(!addNewContainerSelector){
                        shadowSection.remove()
                    }else
                        shadowSection = addNewSection(selectedItem, insertPosition)
                }
    
                return {
                    oncreate: (vnode)=>{
                        sectionDom = vnode.dom;
                        isBottom = vnode.attrs.bottom ? true : false;
                        fixPosition();
                    },
                    onbeforeupdate: () => {
                        fixPosition()
                    },
                    view: ({attrs}) => {
                        const column = attrs.bottom ? "column" : "column-reverse";
                        const gap = !attrs.bottom ? "2em" : null;
                        
                        const styledBtn = {}
                        if(attrs.bottom){
                            styledBtn.top = 0;
                            styledBtn.transform = "translateY(-14px)";
                        }else{
                            styledBtn.bottom = 0;
                            styledBtn.transform = "translateY(14px)";
                        }
                        return (
                            m("",{
                                style: {
                                    position: "absolute",
                                    left: 0,
                                    right: 0,
                                    display: "flex",
                                    justifyContent: "center",
                                    flexDirection: column,
                                    alignItems: "center",
                                    gap: gap,
                                    border: `2px solid ${addNewContainerSelector ? "#bddfcc" : "transparent"}`,
                                },
                            }, [
                                m("button.ui.circular.mini.green.icon.button",{
                                        style: {
                                            position: "absolute",
                                            background: "#489c6d",
                                            ...styledBtn
                                        },
                                        onclick: () => addSection(attrs.insert)
                                    }, m("i.plus.icon")
                                ),
                                addNewContainerSelector 
                                ? m(".ui.fluid.container",{
                                        style: {
                                            marginBottom: attrs.bottom ? null : "50px",
                                            zoom: localStorage.zoom,
                                            background: "#fff",
                                            padding: "50px 1em"
                                        }
                                    }, m(NewSectionView, {
                                        onclose: () => addNewContainerSelector = null,
                                        insert: attrs.insert
                                    }))
                                : null
                            ])
                        )
                    }
                }
    
                function NewSectionView(){
                    return {
                        view: ({attrs}) => {
                            return [
                                m(".ui.container",{
                                    style: {
                                        minHeight: "250px",
                                        display: "flex",
                                        flexDirection: "column"
                                    }
                                },
                                    m(".ui.header.centered",
                                        "Seleccione un layout de la sección"
                                    ),
                                    m(".ui.centered.five.cards",{
                                        style: {
                                            margin: "2rem 0",
                                            flexGrow: "1"
                                        }
                                    },[
                                        [ 
                                            { cols: 1, fr: "1fr" },
                                            { cols: 2, fr: "1fr 1fr" },
                                            { cols: 3, fr: "1fr 1fr 1fr" },
                                            { cols: 4, fr: "1fr 1fr 1fr 1fr" },
                                            { cols: 2, fr: "1fr 2fr" },
                                            { cols: 2, fr: "2fr 1fr" },
                                            { cols: 3, fr: "1fr 2fr 1fr" }
                                        ]
                                        .map( item => (
                                            m(GridViews, {
                                                items: item.cols, 
                                                fr: item.fr,
                                            })
                                        ))
                                    ]),
                                    m(".ui.two.columns.grid.center.aligned", [
                                        m(".row",
                                            m(".ui.grey.header.center", 
                                                "o elige desde"
                                            )
                                        ),
                                        m(".four.wide.column",
                                            m("button.ui.big.fluid.green.button",{
                                                style: {
                                                    backgroundColor: "#489c6d"
                                                }
                                            }, [
                                                m("i.plus.icon"),
                                                "Pre-built secciones"
                                            ])
                                        ),
                                        m(".four.wide.column", 
                                            m("button.ui.big.fluid.green.button",{
                                                style: {
                                                    backgroundColor: "#489c6d"
                                                }
                                            }, [
                                                m("i.plus.icon"),
                                                "Global secciones"
                                            ])
                                        )
                                    ])
                                )
                            ]
        
                            
                        }
                    }
        
                    function GridViews() {
                        return {
                            view: ({attrs})=> {
                                const cols = new Array(attrs.items).fill(1)
                      
                                return (
                                   m("",{
                                       style: {
                                            width: "70px",
                                            height: "50px",
                                            display: "grid",
                                            margin: "1em",
                                            gridTemplateColumns: attrs.fr
                                       }
                                   }, [
                                       cols.map( col => (
                                            m("", {
                                                onclick: () => chooseContent(attrs.fr),
                                                style: {
                                                    border: "3px dotted #7e7e7e",
                                                }
                                            })
                                       ))
                                   ])
                                )
                            }
                        }
                    }
                }
        
            }
                
        }
    
        function DropdownMenu() {
            const items = [
                { onclick: () => moveElement("up"), title: "Move up", icon: "arrow up"},
                { onclick: () => moveElement("down"), title: "Move down", icon: "arrow down"},
            ]
            return {
                view: () => {
                    if(type == 'segment'){
                        items.push(...[
                            { onclick: ()=> addContainer(selectedItem, "beforebegin"), title: "Add before", svg: "izquierda"},
                            { onclick: ()=> addContainer(selectedItem, "afterend"), title: "Add after", svg: "derecha"}
                        ])
                    }
                    return (
                        m(".ui.big.vertical.menu",{
                            style: {
                                position: "absolute",
                                background: "#fff",
                                borderRadius: "5px",
                                right: 0,
                                textAlign: "left",
                                fontFamily: "monospace"
                            }
                        },[
                            m(".item", [
                                m(".header", "Actions"),
                                m(".menu", [
                                    items.map( item => (
                                        m(Item, { item })
                                    ))
                                ])
                            ]),
                            type == 'segment' && m(".item", [
                                m(".header", "Import"),
                                m(".menu", [
                                    { onclick: () => {}, title: "Import section", icon: "download"},
                                    { onclick: () => {}, title: "Insert data", icon: "database"},
                                ].map( item => (
                                    m(Item, { item })
                                )))
                            ]),
                            m(".divider"),
                        ])
                    )
                }
            }
    
            function Item () {
                return {
                    view: (vnode) => {
                        const { onclick, icon, title, svg } = vnode.attrs.item
                        const style = {
                            float: "left",
                            margin: "0 1em 0 1em"
                        }
                        return (
                            m(".item",{
                                onclick: onclick,
                                style: {
                                    color: "#436480"
                                }
                            }, [
                                icon ? m("i.icon", { 
                                    className: icon,
                                    style
                                }) : null,
                                svg ? m(SvgIcon, {
                                    icon: svg,
                                    style
                                }) : null, 
                                title
                            ])
                        )
                    }
                }
            }
        }
    
        function ButtonEdition (){
            return {
                view: (vnode) =>{
                    const { text, icon, onclick, onblur, style, disabled } = vnode.attrs
                    let classes = !text && "icon";

                    if(disabled) classes += " disabled"
                    return (
                        m("button.ui.button", {
                                tabIndex: 0,
                                onblur: onblur,
                                style: {
                                    background: "#e0f8ea",
                                    color: "#436480",
                                    fontWeight: 400,
                                    ...style
                                },
                                className: classes,
                                onclick: onclick
                            },
                            icon &&
                            m("i.icon", {
                                className: icon,
                            }),
                            text,
                            vnode.children
                        )
                    )
                }
            }
        }
    }

    function JsonEditor () {
        const pattern = [
            "className",
            "value",
            "style",
            "localize"
        ]

        return {
            view: ({attrs}) => {
                let json;
                if(type == 'segment') {
                    json = segment_toJson(selected)
                }else if(type == 'component'){
                    json = component_toJson(selected)
                }
                console.log(json)
                return [
                    Object.keys(json).map( key => {
                        if(key !== 'name' && key !== 'type') 
                            return [
                                m("span",{
                                    style: {
                                        fontSize: "12px"
                                    }
                                }, key),
                                pattern.includes(key) 
                                ? m(TextArea, {value: json[key]}) 
                                : m(Input, {value: json[key]})
                            ]
                    })
                ]
            }
        }

        function TextArea(){
            return {
                view: ({attrs}) => (
                    m("textarea", {
                        style: {
                            border: "1px solid #ddd",
                            borderRadius: "2px",
                            fontSize: "11px",
                            fontFamily: "monospace",
                            minWidth: "100%",
                            maxWidth: "100%"
                        },
                        value: attrs.value
                    })
                )
            }
        }

        function Input(){
            return {
                view: ({attrs}) => (
                    m("input", {
                        style: {
                            border: "1px solid #ddd",
                            fontFamily: "monospace",
                            borderRadius: "2px",
                            minWidth: "100%",
                            maxWidth: "100%"
                        },
                        value: attrs.value
                    })
                )
            }
        }

    }

    function ClassEditor () {
        return {
            view: () => {
                return [
                    m("",{
                            style: {
                                display: "flex",
                                alignItems: "center",
                            }
                        }, [
                        m(ClassNameEditor),
                        m("button.ui.icon.button", {
                                tabindex: 0,
                                style: {
                                    background: "transparent"
                                },
                                className: dropdownMenu ? "active" : null,
                                onclick:() => dropdownMenu = !dropdownMenu,
                            },
                                m("i.list.icon")
                        ),
                    ]),
                    dropdownMenu && m(ClassNamesSelect)
                ]
            }
        }

        function ClassNamesSelect () {
            let configClassMenu = false;

            function GridClasses () {
                const gridClasses = [
                    {
                        title: "All",
                        items: [
                            { title: "Padded", add: [ "padded" ], name: "padded", remove: ["padded"] },
                            { title: "Center", add: [ "centered" ], name: "centered", remove: ["centered"] },
                            { title: "Mobile", add: [ "stackable" ], name: "stackable", remove: ["stackable"] },
                            { title: "All devices", add: [ "doubling" ], name: "doubling", remove: ["doubling"] },
                        ]
                    },
                    {
                        title: "Column",
                        items: [
                            { title: "2 columns", add: [ "two", "column", "grid" ], name: "two", oneOf: 1, remove: [ "two", "column" ]},
                            { title: "3 columns", add: [ "three", "column", "grid" ], name : "three", oneOf: 1, remove: [ "three", "column" ]},
                            { title: "4 columns", add: [ "four", "column", "grid" ], name: "four", oneOf: 1, remove: [ "four", "column" ]},
                            { title: "5 columns", add: [ "five", "column", "grid" ], name: "five", oneOf: 1, remove: [ "five", "column" ]},
                            { title: "equal", add: [ "equal", "width", "grid" ], name: "equal", oneOf: 1, remove: [ "equal", "width" ]},
                        ]
                    },
                ]
            
                const clickHandler = ( item ) => {
                    if(item.oneOf){
                        if(selected.className.indexOf(item.name) > -1){
                            item.remove.map( el => selected.classList.remove(el))
                            
                        }else{
                            ["equal", "width", "two", "three", "four", "five", "grid", "column" ].map( el => selected.classList.remove(el));
                            item.add.map( el => selected.classList.add(el))
                        }
                        
                    }
                    else{
                        if(selectedItem.className.indexOf(item.name) > -1){
                            item.remove.map( el => selected.classList.remove(el))
                        }else{
                            item.add.map( el => selected.classList.add(el))
                        }
                    }
                }
                return {
                    view: () => {
                        return [
                            gridClasses.map( item => {
                                return [
                                    m(".header", item.title),
                                    item.items.map( el => (
                                        m(".item", {
                                            onclick: () => clickHandler(el)
                                        },[
                                            m("code", [
                                                m("i.icon",{
                                                    className: selectedItem.className.indexOf(el.name) > -1 && "green check"
                                                }),
                                                el.title
                                            ])
                                        ])
                                    ))
                                ]
                            })
                        ]
                    }
                }
            }

            function ColumnClasses () {
                const columnClasses = [
                    {
                        title: "All",
                        items: [
                            { title: "Center", add: [ "centered" ], name: "centered", remove: ["centered"] },
                        ]
                    },
                    {
                        title: "Column",
                        items: [
                            { title: "auto", name: "auto",oneOf: 1},
                            { title: "1/16", add: [ "one", "wide" ,"column" ], name: "one", oneOf: 1, remove: [ "one", "wide" ]},
                            { title: "2/16", add: [ "two", "wide" ,"column" ], name: "two", oneOf: 1, remove: [ "two", "wide" ]},
                            { title: "3/16", add: [ "three", "wide" ,"column" ], name : "three", oneOf: 1, remove: [ "three", "wide" ]},
                            { title: "4/16", add: [ "four", "wide" ,"column" ], name: "four", oneOf: 1, remove: [ "four", "wide" ]},
                            { title: "5/16", add: [ "five", "wide" ,"column" ], name: "five", oneOf: 1, remove: [ "five", "wide" ]},
                            { title: "6/16", add: [ "six", "wide" ,"column" ], name: "six", oneOf: 1, remove: [ "six", "wide" ]},
                            { title: "7/16", add: [ "seven", "wide" ,"column" ], name: "seven", oneOf: 1, remove: [ "seven", "wide" ]},
                            { title: "8/16", add: [ "eight", "wide" ,"column" ], name: "eight", oneOf: 1, remove: [ "eight", "wide" ]},
                            { title: "9/16", add: [ "nine", "wide" ,"column" ], name: "nine", oneOf: 1, remove: [ "nine", "wide" ]},
                            { title: "10/16", add: [ "ten", "wide" ,"column" ], name: "ten", oneOf: 1, remove: [ "ten", "wide" ]},
                            { title: "11/16", add: [ "eleven", "wide" ,"column" ], name: "eleven", oneOf: 1, remove: [ "eleven", "wide" ]},
                            { title: "12/16", add: [ "twelve", "wide" ,"column" ], name: "twelve", oneOf: 1, remove: [ "twelve", "wide" ]},
                            { title: "13/16", add: [ "thirteen", "wide" ,"column" ], name: "thirteen", oneOf: 1, remove: [ "thirteen", "wide" ]},
                            { title: "14/16", add: [ "fourteen", "wide" ,"column" ], name: "fourteen", oneOf: 1, remove: [ "fourteen", "wide" ]},
                            { title: "15/16", add: [ "fifteen", "wide" ,"column" ], name: "fifteen", oneOf: 1, remove: [ "fifteen", "wide" ]},
                            { title: "16/16", add: [ "sixteen", "wide" ,"column" ], name: "sixteen", oneOf: 1, remove: [ "sixteen", "wide" ]}
                        ]
                    },
                ]
            
                const clickHandler = ( item ) => {
                    if(item.oneOf){
                        if(selected.className.indexOf(item.name) > -1){
                            item.remove.map( el => selected.classList.remove(el))
                            
                        }else{
                            ["one", "two", "three", "four", "five","six", "seven", "eight", "nine", "ten", "eleven", "twelve","thirteen","fourteen","fifteen","sixteen", "wide" ].map( el => selected.classList.remove(el));
                            item.add && item.add.map( el => selected.classList.add(el))
                        }
                        
                    }
                    else{
                        if(selectedItem.className.indexOf(item.name) > -1){
                            item.remove.map( el => selected.classList.remove(el))
                        }else{
                            item.add.map( el => selected.classList.add(el))
                        }
                    }
                }
                return {
                    view: () => {
                        return [
                            columnClasses.map( item => {
                                return [
                                    m(".header", item.title),
                                    item.items.map( el => (
                                        m(".item", {
                                            onclick: () => clickHandler(el)
                                        },[
                                            m("code", [
                                                m("i.icon",{
                                                    className: selectedItem.className.indexOf(el.name) > -1 && "green check"
                                                }),
                                                el.title
                                            ])
                                        ])
                                    ))
                                ]
                            })
                        ]
                    }
                }
            }

            return {
                view: () => {
                    return (
                        m(".ui.fluid.secondary.vertical.menu",
                            m(".item",[
                                m(".header", "Semantic-UI classes"),
                                // Elegir los tipos en función del padre
                                m(".menu",[
                                    [
                                        {name: "container"},
                                        {name: "column", editor: m(ColumnClasses)},
                                        {name: "grid", editor: m(GridClasses)},
                                        {name: "segments"},
                                        {name: "row"},
                                        {name: "cards"},
                                        {name: "fluid"},
                                        {name: "sin-clase"}
                                    ].map( item => (
                                        m(".item",{
                                            style: {
                                                display: "flex", 
                                                alignItems:"center"
                                            },
                                            onclick:(e) => {
                                                if(item.name == "sin-clase"){
                                                    selectedItem.removeAttribute("data-type")
                                                }else{
                                                    selectedItem.setAttribute("data-type", item.name)
                                                }

                                                if(selectedItem.className.indexOf(item.name) > -1)
                                                    selectedItem.classList.remove(item.name)
                                                else
                                                    selectedItem.classList.add(item.name)
                                            },
                                        }, [
                                            m("code",[
                                                m("i.icon",{
                                                    className: selectedItem.className.indexOf(item.name) > -1 && "green check"
                                                }),
                                                item.name,
                                            ]),
                                            selectedItem.className.indexOf(item.name) > -1 && item.editor
                                            && m("button.ui.mini.basic.icon.top.right.pointing.dropdown.button",{
                                                tabIndex: 0,
                                                style: {
                                                    padding: "4px",
                                                    marginLeft: "auto"                                                
                                                },
                                                onblur:()=>configClassMenu = null,
                                                onclick: (e) => {
                                                    e.stopPropagation();
                                                    if(!configClassMenu) configClassMenu = item.name
                                                    else configClassMenu = null
                                                }
                                            },[
                                                m("i.cog.icon"),
                                                configClassMenu == item.name && item.editor && [
                                                    m(".transition.menu.visible",{
                                                        onclick: (e) => e.stopPropagation()
                                                    },[
                                                        item.editor
                                                    ])
                                                ]
                                            ]),
                                            
                                        ])
                                    ))
                                ]), 
                                
                            ])
                            // m(".item",
                            //     m(".header","Bloques"),
        
                            //     /// !!! estas definiciones hay que ponerlas en la base de datos para que sean editables
                            //     /// Puede configurarse por web, realm, ....
                            //     m(".menu",[
                            //         m(".item",{
                            //             onclick:()=>{
                            //                 var element = segment_render("",   {
                            //                     "type": "cards",
                            //                     "style": "padding: 1rem;",
                            //                     "dataid": "302",
                            //                     "className": "ui four cards",
                            //                     "segments": [{
                            //                         "style": "padding: 1rem;",
                            //                         "dataid": "304",
                            //                         "className": "ui placeholder",
                            //                     }]
                            //             })
                            //             $(selectedItem).replaceWith(element);
                            //             //   $(selectedItem).append(element);
                            //             }
                            //         }, m("code", "cards")),
                            //         m(".item",{
                            //             onclick:()=>{
                            //                 var element = segment_render("",   {
                            //                         "type": "ui",
                            //                         "style": "padding: 1rem;",
                            //                         "dataid": "445",
                            //                         "className": "ui card",
                            //                         "segments": [
                            //                         {
                            //                             "type": "image",
                            //                             "style": "padding: 1rem;",
                            //                             "dataid": "320",
                            //                             "className": "ui image",
                            //                             "components": [
                            //                             {
                            //                                 "name": "dv-simple",
                            //                                 "type": "component",
                            //                                 "dataid": "322",
                            //                                 "alt": "Imagen",
                            //                                 "tag": "img",
                            //                                 "src": "images/noimage.png",
                            //                                 "value": ""
                            //                             }
                            //                             ]
                            //                         },
                            //                         {
                            //                             "type": "content",
                            //                             "style": "padding: 1rem;",
                            //                             "dataid": "321",
                            //                             "className": "ui content",
                            //                             "components": [
                            //                             {
                            //                                 "name": "dv-simple",
                            //                                 "type": "component",
                            //                                 "className": "header",
                            //                                 "dataid": "323",
                            //                                 "tag": "p",
                            //                                 "value": "Título"
                            //                             },
                            //                             {
                            //                                 "name": "dv-simple",
                            //                                 "type": "component",
                            //                                 "className": "description",
                            //                                 "dataid": "325",
                            //                                 "tag": "p",
                            //                                 "value": "statement baseball safety solution ear government computer artisan unit singer"
                            //                             }
                            //                             ]
                            //                         },
                            //                         {
                            //                             "type": "column",
                            //                             "style": "padding: 1rem;",
                            //                             "dataid": "329",
                            //                             "className": "ui extra content column",
                            //                             "components": [
                            //                             {
                            //                                 "name": "dv-simple",
                            //                                 "type": "component",
                            //                                 "dataid": "330",
                            //                                 "tag": "p",
                            //                                 "value": "otra"
                            //                             }
                            //                             ]
                            //                         }
                            //                         ]
                            //                 })
                            //                 $(selectedItem).replaceWith(element);
                            //                 //   $(selectedItem).append(element);
                            //                 },
                            //         },m("code", "card")),
                            //         m(".item",m("code", "grid")),
                            //         m(".item",m("code", "masonry")),
                            //         m(".item",m("code", "masonry")),
                            //     ])
        
                            // ),
                            // m(".item",
                            //     m(".header","Plantillas"))
                        )
                    )
                }
            }
        }
    
        function ClassNameEditor () {
            let editClassName = false,
                isChanging = false,
                classes;
            return {
                view: () => {
                    return (
                        m("",{
                            style: {
                                display: "flex",
                                flexDirection: "row",
                                flexGrow: 1,
                                alignItems: "center"
                            }
                        },[
                            !editClassName 
                            ? m("em", [
                                selected.className.replace("selected", ""),
                            ])
                            : m("textarea", {
                                style: {
                                    flexGrow: "1",
                                    border: "1px solid #ddd"
                                },
                                oninput: (e) => {
                                    isChanging = true;
                                    classes = e.target.value
                                },
                                value: classes
                            }),
                            m("button.mini.ui.icon.button", {
                                style: {
                                        background: "transparent",
                                        marginLeft: "auto"
                                    },
                                    onclick:() => {
                                        if( editClassName ){
                                            editClassName = false;
                                            isChanging = false
                                        }else{
                                            editClassName = !editClassName;
                                            classes = selected.className.replace("selected", "")
                                        }
                                    },
                                }, [
                                    editClassName 
                                    ? m("i.close.icon") 
                                    : m("i.pencil.alternate.icon")
                            ]),
                            isChanging
                            && m("button.mini.ui.positive.icon.button", {
                                    style: {
                                        padding: "12px 7px"
                                    },
                                    onclick:() => {
                                        editClassName = false;
                                        isChanging = false;
                                        selectedItem.className = classes + " selected"
                                    },
                                },"OK"),             
                        ])
                    )
                }
            }
        }

    }

    let editorCodeMirror = true,
        edirorSelected = true,
        moreComponents = false,
        moreSegments = false,
        datasourcelement;
        

    return {
        onbeforeupdate:() => {
            if(selectedItem){
                let parent = selectedItem.parentElement;
                selected = selectedItem
                referenceItem =  selectedItem.hasAttribute("data-ref") ? true : false;
                type = selectedItem.hasAttribute("data-editor") ? selectedItem.getAttribute("data-editor") : null
                if(type == "segment"){
                    selectedName = selectedItem.hasAttribute("data-name") ? selectedItem.getAttribute("data-name") : "";
                }else if(type == "component" && selectedItem.hasAttribute("data-component") ){
                    const componenteName = selectedItem.getAttribute("data-component");
                    selectedName = componenteName != "dv-simple" ? componenteName : selectedItem.tagName.toLowerCase()
                    componentmenu = componentMenu();
                }

                if(parent && parent.hasAttribute('id') && parent.getAttribute('id') === "main"){
                    isSection = true;
                }else{
                    isSection =  false;
                }
                // editorCodeMirror = true;
                // edirorSelected = true;
                positionSelectedMenu();
                visible = true
            }
        },
        onupdate:() => {
            editorCodeMirror = true;
            edirorSelected = true;
            positionSelectedMenu();
        },
        view:() => {
            if(!selectedItem) return
            
            return [
                m(SelectedElementEditorBar),
                m("", {
                    style: {
                        display: 'inline-flex',
                        position: "relative",
                        // zIndex: "998",
                        background: "#fff"
                    }
                },[
                    edirorSelected && 
                    m(Panel,{
                        mode: 'left',
                        height: "auto",
                        controls: false,
                        width:"300",
                        style:{
                            padding: 0,
                            flexShrink: 0
                        },
                        onclose:()=>{
                            console.log('close 1 panel')
                            edirorSelected = false;
                        }
                    },[
                        [
                            m(".ui.segment",{
                                style: {
                                    position: "relative",
                                    // zIndex: "999",
                                    // height: "95vh",
                                    background: "#fff",
                                    margin: "0"
                                }
                            },[
                                type == "segment" && visible 
                                ? [
                                    m(".ui.inverted.tiny.header",{
                                        style: {
                                            background: "rgb(239, 134, 134)",
                                            margin: "-1em -1em 1em",
                                            padding: "0.6em",
                                        },
                                    },[
                                        m("i.large.cube.icon"),
                                        selectedName 
                                        || "Segment",
                                       // selectedItem.getAttribute('data-ref') && m("i.share.square.icon")
                                    ]),
                                    selectedItem && selectedItem.hasAttribute('data-ref') 
                                    && m("",[
                                            m("strong","reference:"),
                                            m("",{
                                                style: {
                                                    display: "flex",
                                                    alignItems: "center",
                                                    paddingLeft: "5px"
                                                }
                                            },[
                                                m("code", selectedName),
                                                m("button.small.ui.icon.button",{
                                                    style: {
                                                        marginLeft: "auto",
                                                        background: "transparent",
                                                    },
                                                    onclick: () => {
                                                        selectedItem.hasAttribute('data-ref') && abrirSegmentoRef()
                                                    }
                                                },
                                                    m("i.external.alternate.icon"), 
                                                )
                                            ])
                                    ]),
                                    m(ClassEditor),
                                    m(".ui.divider"),
                                    m("",[
                                        m("",{
                                            style: {
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between"
                                            }
                                        },[
                                            m("em", "componentes"),
                                            m("button.ui.icon.button",{
                                                style: {
                                                    background: "transparent"
                                                },
                                                onclick: () => moreComponents = true
                                            }, m("i.icon",{
                                                className: moreComponents ? "minus" : "plus"
                                            }))
                                        ]),
                                        m("",[
                                            [
                                                {tag: "div", child: "div"},
                                                {tag: "p", child: m("i.paragraph.icon")},
                                                {tag: "a", child: m("i.linkify.icon")},
                                                {tag: "h1", child: m("i.heading.icon")},
                                                {tag: "img", child: m("i.image.icon")},
                                            ].map( el => (
                                                m("button.mini.ui.icon.button", {
                                                    style: {
                                                        background: "transparent"
                                                    },
                                                    onclick:() => addElement("dv-simple", el.tag, ""),
                                                }, el.child)
                                            )),
                                            moreComponents && m(ComponentsList,{onclose: () => moreComponents = false})
                                        ])
                                    ]), 
                                    m(".ui.divider"),
                                    m("",[
                                        m("",{
                                            style: {
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between"
                                            }
                                        },[
                                            m("em", "plantillas"),
                                            m("button.ui.icon.button",{
                                                style: {
                                                    background: "transparent"
                                                },
                                                onclick: () => moreSegments = true
                                            }, m("i.icon",{
                                                className: moreSegments ? "minus" : "plus"
                                            }))
                                        ]),
                                        moreSegments && m(ImportSegment,{
                                            onclose: () => moreSegments = false, segment: moreSegments
                                        })
                                    ]), 
                                    m(".ui.divider"),
                                    m("",[
                                        m("",{
                                            style: {
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between"
                                            }
                                        },[
                                            m("em", "data source insert"),
                                            m("button.ui.icon.button",{
                                                style: {
                                                    background: "transparent"
                                                },
                                                onclick:()=> datasourcelement = !datasourcelement,
                                            }, m("i.icon", {
                                                className: datasourcelement ? "minus" : "plus"
                                            }))
                                        ]),
                                        datasourcelement && m(DataSourceElement, { onclose: () => datasourcelement = false })
                                    ]), 
                                    m(".ui.divider"),
                                    m("button.ui.small.button", {
                                            title: "Añadir notas",
                                            onclick: () => addNote = !addNote
                                        }, 
                                        m("i.comment.alternate.outline.icon"),
                                        "Notas" 
                                    ),
                                    addNote && selectedItem
                                    ? m("textarea",{
                                        oninput:(e) => selectedItem.setAttribute("data-comments", e.target.value),
                                            style: { 
                                                width: "100%"
                                            },
                                            rows:5
                                        },
                                        selectedItem.getAttribute("data-comments") || '',
                                    )
                                    :null,                        
                                ]
                                : null,
                                type == "component" && visible 
                                ? [
                                    m(".ui.inverted.tiny.header",{
                                        style: {
                                            background: "rgb(134, 185, 239)",
                                            margin: "-1em -1em 1em",
                                            padding: "0.6em",
                                        }
                                    },[
                                        m("i.paint.brush.icon"),
                                        selectedName.toUpperCase()
                                    ]),
                                    m(".ui.small.basic.buttons",[
                                        componentmenu && m.trust(componentmenu),
                                    ]),
                                    m(".ui.divider"),
                                    m(".ui.tabular.mini.menu.attached",
                                        ["VALUE", "STYLE", "JSON"]
                                        .map( ( item, i ) => (
                                                m(".item", {
                                                    onclick: () => editorMenu = i +1,
                                                    className: editorMenu === i + 1 && 'active'
                                                }, item)
                                            )
                                        )
                                    ),
                                    m(".ui.bottom.attached.segment",{
                                            style: {
                                                maxHeight: "700px",
                                                overflow: "auto"
                                            }
                                        },[
                                        editorMenu == 1 
                                        ? m(TextEditor, {
                                                label: "Editor HTML",
                                                data: selectedItem.dataset,
                                                name: "value",
                                                onchange: (value) => {
                                                    selectedItem.setAttribute("data-value", value)
                                                    replaceNodo(segment_toJson(selectedItem))
                                                }
                                        })
                                        // : editorMenu == 2
                                        //     ? m(CssEditor)
                                                : editorMenu == 3
                                                    ? m(JsonEditor)
                                        :null
                                    ]),
                                ]
                                : null
                            ]),
                        ],
                        selectedItem && editorCodeMirror &&
                        m(Panel,{
                                mode:"bottom",
                                style: {
                                    width: "100%",
                                },
                                onclose:()=>{
                                    editorCodeMirror = false
                                }
                            },
                            type == "segment" &&
                                m(EditorCodeMirror, {
                                    data: segment_toJson(selectedItem),
                                    mode: 'json',
                                    theme: 'hopscotch'
                                }),
                            type == "component" &&
                                m(EditorCodeMirror, {
                                    data: component_toJson(selectedItem),
                                    mode: 'json',
                                    theme: 'hopscotch',
                                    onsave:()=>alert("on save")
                                }),


                            m(".ui.button",{
                                onclick:()=>{
                                    try {
                                        let json = JSON.parse(_value);
                                        replaceNodo(json);
                                    } catch (e) {
                                        alert("Error en el formato JSON");
                                        console.log(e,_value);
                                    }
                                }
                                
                            },"Cambiar")
                        ),
                    ])
                ])
            ]
        }
    }
}

/**2.
 * Guarda la información general de la página en pageData
 *
 */

/* Guardar Pagina  */
function guardarPagina(data) {

    if (!data.owners || data.owners.lenght < 1) {
        data.owners = new Array(USERDATA._id)
    }

    if(data.name == ""){
        viewMainMessage("error", "La 'URI' no puede estar vacia!")
        document.getElementById("page-uri").focus()
        return
    }

    return doAjax(API + getRealm() + "/collections/paginas/" + data._id, "PUT", "json" , data)
        .then(function(json) {
            if(json){
                viewMainMessage("positive", "¡Guardado!");
            } else {
                viewMainMessage("error", "Error en la conexión");
            }
            return json
        });
}

function PageMenu() {
    let consoleOpen = false,
        activeAccordion,
        editpagemodal=false,
        newpagemodal=false,
        galeria=false,
        modalpaginas=false,
        revisions=false,
        compactMenu = localStorage.compactMenu ? localStorage.compactMenu : false;

    let zoom = localStorage.zoom || 1;

    function xZoom() {
        const main = document.getElementById("main");
        main.style.zoom = zoom;

        const w = 1450 * zoom;
        document.getElementById("web-title").style.maxWidth = w + "px"
    }
    const menu = [
        {title: "ocultar textos", onclick: ()=> {compactMenu=!compactMenu; localStorage.compactMenu = compactMenu}, description: "Compact Menú", icon: (i)=> i ? "chevron right" : "chevron down"},
        {title: "Abrir", onclick: ()=> {unselectItem();  modalpaginas=!modalpaginas}, description: "Abrir", icon: "folder open"},
        {title: "Crear nueva", onclick: ()=> {unselectItem();  newpagemodal=!newpagemodal}, description: "Nueva página", icon: "file outline"},
        {title: "Guardar", onclick: ()=> saveEditedPage(), description: "Guardar", icon: "save"},
        {title: "Galería", onclick: ()=> galeria=!galeria, description: "Galería", icon: "table"},
        {title: "Historial", onclick: ()=> revisions=!revisions, description: "Retrocede a la versión anterior", icon: "undo"},
        {title: "Ajustes", onclick: ()=> editpagemodal=!editpagemodal, description: "Ajustes de la página", icon: "cog"},
        {title: "Data Source", onclick: ()=> openDefaultModal("javascript","datasources"), description: "Data Source", icon: "database"},
        {title: "JavaScript", onclick: ()=> openDefaultModal("javascript","javascript"), description: "Javascript de la página", icon: "js square"},
        {title: "CSS", onclick: ()=> openDefaultModal("css","css"), description: "CSS de la página", icon: "css3"},
        {title: "JSON", onclick: ()=> openDefaultModal("javascript","pageJSON"), description: "JSON de la Página", icon: "info"},
        {title: "Ficheros", onclick: ()=> openImagePopup(), description: "Files", icon: "image"}
    ]
    return {
        oninit:()=>{
            xZoom()
        },
        view:()=>{
            if(!pageData._id) return null
  
            return [
                m(".ui.menu",{
                    style: {
                        boxShadow: "none",
                        border: "none",
                        borderRadius: "0",
                        display: "flex",
                        flexDirection: "column",
                        width: compactMenu ?  "auto" : "180px"
                    }
                },[
                    menu.map( item => {
                        return m("a.item", {
                            onclick: item.onclick,
                            title: item.description
                        },[
                            m("i.icon", {
                                className: typeof item.icon === 'function' ? item.icon(compactMenu) : item.icon
                            }),
                            !compactMenu ? m("span", item.title) : null
                        ])
                    }),


                    m("a.item", {
                        className: control.menucollapsible ? "active" : null,
                        onclick: () => {

                            // let nodo = mainPage.getElementById('main').children
                            // pageData.segments = segment_toJson(nodo)

                            //console.log(_json, pageData)
                            //viewData = !viewData
                            control.menucollapsible = !control.menucollapsible
                            $("#selected-menu").show()

                            //console.log(control)
                            //m.redraw()
                        }
                    }, m("i.list.alternate.icon"), !compactMenu ? "Mapa segmentos" : null),
                    m("a.item",{
                            style: {
                                position: "relative",
                            },
                            className: consoleOpen ? 'active': '',
                            onclick:()=> consoleOpen = !consoleOpen
                        },[
                            m("i.bug.icon"),
                            m(".ui.circular.label", {
                                className: pageData.errors.length ? "red" : "",
                                style: {
                                    position: "absolute",
                                    top: "6px",
                                    right: "6px",
                                    fontSize: "10px",
                                }
                            }, pageData.errors.length ? pageData.errors.length : "0"),
                            !compactMenu ? 
                            m("span", {
                                style: {marginRight: "1em"}
                            },"Consola")
                            :null,                    
                    ]),
                    m("",{
                            style: {
                            position: "fixed",
                            bottom: "0",
                            padding: ".5em .5em",
                            zIndex: 1,
                            width: "100%",
                            display: "flex",
                            justifyContent: "center"
                        }
                    },[
                        // m(".ui.small.positive.button", {
                        //     onclick: ()=> saveEditedPage(),
                        //     title: "Guardar página"
                        // }, 
                        //     m("i.sync.icon"),
                        //     "Actualizar"
                        // ),
                        m(".ui.small.positive.buttons",{
                                style: {
                                    boxShadow: "0 0 9px 0px #0000009c"
                                }
                            },[
                            m(".ui.button.zoom", {
                                onclick:()=>{
                                    zoom/=1.2;
                                    localStorage.zoom = zoom
                                    xZoom()
                                }
                            }, m("i.minus.icon")),
                            m(".ui.button.zoom", Math.round(zoom*100) + "%"),
                            m(".ui.button.zoom", {
                                    onclick:()=>{
                                        zoom*=1.2;
                                        localStorage.zoom = zoom
                                        xZoom()
                                    }
                                }, m("i.plus.icon"))
                        ])
                    ])
                ]),

                modalpaginas
                ? m(ModalPaginas)
                : null,

                editpagemodal
                ? m(EditPageModal)
                : null,

                newpagemodal
                ? m(NewPageModal)
                : null,

                galeria
                ? m(Galeria)
                : null,

                revisions
                ? m(Revisions, {close: ()=>revisions = null})
                :null,


                consoleOpen
                ? m(DraggableDialog,{
                        onclose: ()=> consoleOpen = null
                    },m(".ui.scrollable.segment",{
                        style: {
                                minWidth: "300px",
                                margin: "0"
                            }
                        },[
                        m(".ui.header.centered","Consola de errores"),
                        pageData.errors.length > 0 ?
                        m(".ui.basic.segment",{
                            style: {
                                    margin: "0",
                                    width: "400px",
                                    height: "300px",
                                    overflow: "auto",
                                    padding: "1px"
                                }
                            },[
                            m(".ui.styled.accordion",[
                                pageData.errors.map((error, i )=>{
                                    let isActive = activeAccordion === i ? "active" : null;
                                    return [
                                        m(".title",{
                                            onclick:() => {
                                                if(activeAccordion === i) 
                                                    activeAccordion = null
                                                else
                                                    activeAccordion = i
                                            },
                                            className: isActive
                                        },[
                                            m("i.dropdown.icon"),
                                            error.err
                                        ]),
                                        m(".content", {
                                            className: isActive
                                        },m(".ui.inverted.grey.segment", error.expr))
                                    ]
                                })
                            ])
                        ])
                        : null
                    ])
                )
                : null,

                ]

            }
        }

        function EditPageModal() {
            let tab=0
            return {
                view: ()=>{
                    return m(Modal,{
                            onclose: ()=> editpagemodal = false,
                            header: "Edita datos de la página"
                        },[
                        m(".ui.top.attached.tabular.menu", [// !!! porque tengo que darle color????
                            ["Principal", "Dependencias","Context"].map( (item, i) =>
                                m("a.item",{
                                    className: tab == i ? "active" : "",
                                    onclick:()=>tab=i
                                },item)
                            )
                        ]),

                        m(".ui.bottom.attached.segment",
                            m(".ui.form",[
                                tab == 0
                                ? [
                                    m(".field", m(CopyToClipboard, {tocopy: pageData._id})),
                                    m(".field", m(Input, {
                                        data: pageData,
                                        name: "name",
                                        label: "URI",
                                        placeholder: 'nombre-de-pagina'
                                    })),
                                    m(".field", m(Input, {
                                        data: pageData,
                                        name: "title",
                                        label: "Título",
                                        placeholder: 'Escribe el título de la página'
                                    })),
                                    m(".field", m(Input, {
                                        data: pageData,
                                        name: "favicon",
                                        label: "Favicon de la página",
                                        placeholder: 'URL del favicon de la página'
                                    })),
                                    m(".field", m(Checkbox, {
                                        data: pageData,
                                        name: "templates",
                                        label: "Señala si ésta es una página de Plantillas",
                                    })),
                                    m(".field", m(Input, {
                                        data: pageData,
                                        name: "web",
                                        label: "Nombre de la web",
                                        placeholder: 'Escribe el nombre de la web'
                                    })),
                                    m(".field", m(Input, {
                                        data: pageData,
                                        name: "section",
                                        label: "Sección de la web",
                                        placeholder: 'Escribe el nombre de la sección'
                                    })),
                                ]
                                :null,
                                tab==1
                                ? [
                                    m(".field",[
                                        m("label", "Dependencias"),
                                        m(JsonEdit, {
                                            data: pageData,
                                            name: "dependencies",
                                            placeholder: `{ "js": [], "css": [] }`
                                        })
                                    ]),
                                    m(".field", [
                                        m("label", "Editores"),
                                        m(JsonEdit, {
                                            data: pageData,
                                            name: "owners",
                                            placeholder: "Lista de Ids de Editores separados por comas",
                                            style: { height: "60px"}
                                        })
                                    ]),
                                ]
                                :null,
                                tab == 2
                                ? m(".field", [
                                    m("label", "Contexto"),
                                    m(JsonEdit, {
                                        data: pageData,
                                        name: "context",
                                        placeholder: "Lista de variables de la página"
                                    })
                                ])
                                : null,

                                m("div.field", [
                                    m("button.ui.button",{
                                        onclick: ()=> editpagemodal = false
                                    }, "Cancelar"),
                                    m("button.ui.button.positive",{
                                        onclick: async ()=>{
                                            const res = await guardarPagina(pageData);
                                            if(res && res._id) {
                                                editpagemodal = false
                                                m.redraw()
                                            }
                                        }
                                    },"Guardar")
                                ]),

                                // m(".ui.error.message[id='editPageError']", {"style":{"display":"none"}},
                                //   [
                                //     m("div.ui.header", "Hubo un error"),
                                //     m(".content[id='editPageErrorMessage']")
                                //   ]
                                // )
                            ])
                        )
                    ])
                }
            }
        }

        function NewPageModal() {

            /*
                $("#saveDataError").hide();
                $("#templateName").val(pageData.name ? "copia_" + pageData.name : "");
                $("#templateTitle").val(pageData.title || "");
                $("#templateWeb").val(pageData.web || "");
                $('#saveDataModal').modal('show');
            */
            return {
                view:()=> m(Modal,{
                        onclose: ()=> {
                            newpagemodal = false
                        },
                        header: "Crear nueva página"
                    },
                        m(".ui.basic.segment",[
                        //     m(".ui.form",[
                        //         m(".field",[
                        //             m("label", "Escribe el nombre de la página"),
                        //             m("input[required]", { type: 'text', name: 'templateName'})
                        //         ]),
                        //         m(".field",[
                        //             m("label", "Escribe el título de la página"),
                        //             m("input[required]", {type: 'text',name: 'templateTitle'})
                        //         ]),
                        //         m(".field",[
                        //             m("label", "Escribe el nombre de la web"),
                        //             m("input[required]", {type: 'text', name: 'templateWeb'})
                        //         ]),

                        //     ]),
                        //     m("button.ui.button",{
                        //         type: 'button',
                        //         // onclick: saveNewPage()
                        //     },"Crear"),
                        //     m(".ui.error.message", {"style":{"display":"none"}},[
                        //         m("div.ui.header", "Hubo un error"),
                        //         m("p", "Nombre de archivo vacio o demasiado corto")
                        //     ])

                        // !!! cambiar para que funcione el dblclick

                            m(TemplatePages, {
                                selectedWeb: pageData.web,
                                data: pageData
                            }),
                            m(".column", [
                                m(".ui.button", {
                                    onclick:  ()=> newpagemodal = false
                                }, "Cancelar"),
                                m(".ui.button.positive", {
                                    onclick:async ()=>{
                                        renderPage(pageData).then(res =>{
                                            newpagemodal = false;
                                            // le cambiamos el nombre
                                            //pageData.name = `Nueva ${Math.floor(Date.now() / 1000)}`
                                            savePage(API + getRealm() + "/collections/paginas", "POST")
                                        });
                                    }
                                }, "Crear")
                            ])
                        ])

                    )
            }
        }

        function ModalPaginas(){
            return{
                view: ()=>{
                    if(!modalpaginas) return null
                    return m(Modal,{
                        size: "fullscreen",
                        close: ()=> modalpaginas = false,
                        header: `Gestor de páginas ( ${REALM} )`,
                        top: "50px"
                    }, [
                        m(".ui.grid.equal.width",{style: {height: "100%", minHeight: "80vh",margin: "-1.5em"}},[
                            m(GestorPaginas,{callback:()=> modalpaginas = false})
                        ])
                    ]);
                }
            }
        }

        // Muestra las miniaturas de las páginas de una web
        function Galeria() {
            let inicial=0
            let paginas={json:[],html:[]}
            let max=100
            let zoom=0.3
            let scale=1
            let loading=false
            const step=3
            return {
                oninit:() => {
                    load()
                },
                view:()=>{
                    return paginas
                    ? [
                        m(Modal,{onclose:()=>galeria=false},
                            m(".ui.seven.columns.equal.width.center.aligned.grid",
                                m(".row",
                                    m(".one.wide.column",{
                                        style:"margin:auto",
                                        onclick:()=>{if (inicial>=step) {inicial-=step; load()}}
                                    },m("i.ui.chevron.left.big.icon")),
                                    paginas.html.map(p=>m(".column",{style:`height:2000px;zoom:${zoom}`},
                                        loading
                                        ? m(".ui.active.dimmer",m(".ui.loader"))
                                        : m("iframe",{
                                                style:`width:100%;height:100%;border:0;transform:scale(${scale})`,
                                                srcdoc:p
                                            }))),
                                    m(".one.wide.column",{
                                        style:"margin:auto",
                                        onclick:()=>{if (inicial<max) {inicial+=step; load()}}
                                    },m("i.ui.chevron.right.big.icon"))),
                                m(".row",
                                    m(""),
                                    paginas.json.map(p=>m(".column",m(".ui.basic.button",{
                                            onclick:()=>{galeria=false;cargarPagina({id:p._id,edition:1})}
                                        },"Abrir"))),
                                    m(""))
                        ))
                    ]
                    : null
                }
            }

            function load() {
                loading=true
                m.redraw()
                doAjax(API + getRealm() + `/collections/paginas?offset=${inicial}&limit=${step}`)
                .then(function(data) {
                    if (data && data.items && data.items.length > 0) {
                        paginas.json=data.items
                        // Cambiamos el style para hacer zoom
                        paginas.json.forEach(p=>p.style+=`html{zoom:${zoom}} body::-webkit-scrollbar {width: 4px;height: 10px;}}`)
                        Promise.all(data.items.map(p=>page_toHTML(p, getRealm(), {})
                        .catch(e=>console.log(e))))
                        .then(res=>{
                            paginas.html=res
                            loading=false
                            m.redraw()
                        })
                    }})
            }
        }

        /**Guarda una página previamente cargada */
        // !!!! porque no vale GuardarPagina?????
        // function saveEditedPage() {
        //     if (typeof pageData._id != "undefined" && pageData._id.length > 0) {
        //         savePage(API + getRealm() + "/collections/paginas/" + pageData._id, "PUT")
        //     } else {
        //         // guardamos en pageData para no perder los cambios
        //         var nodo = document.getElementById('main').children
        //         var segments = segment_toJson(nodo)
        //         pageData['segments'] = segments
        //         viewMainMessage("error", "Esta página no tiene ID. Guárdala como Nueva.")
        //     }
        //     unselectItem()
        //     $('#saveEditedDataModal').modal('hide')
        // }
}

function TemplatePages(){
    let plantillas, data, selected;

    return {
        oninit:({attrs})=>{
            //console.log('TemplatePages: ', attrs)
            // api_get(API + getRealm() + "/collections/webs?&fields=plantilla&web=" + web)
            // .then(data => {
            //     if(data.items && data.itemsCount > 0 && data.items[0].plantilla ){
            //         plantillas = data.items[0].plantilla
            //     }
            // })

            data = attrs.data
            plantillas = [
                {title: "En blanco", img: "https://cdn.digitalvalue.es/alcantir/assets/62a2186f00a56be932692e27?w=200", type: "empty"},
                {title: "Simple", img: "https://public.digitalvalue.es:8789/alcantir/assets/62948d355099285515aecfd9?w=200", type: "basic"},
                {title: "2 culumnas", img: "https://public.digitalvalue.es:8789/alcantir/assets/62948d355099285515aecfdb?w=200", type: "2-cols-right"},
                {title: "2 columnas", img: "https://public.digitalvalue.es:8789/alcantir/assets/62948d355099285515aecfda?w=200", type: "2-cols-left"},
                {title: "4 items", img: "https://public.digitalvalue.es:8789/alcantir/assets/62948d355099285515aecfdc?w=200", type: "4-cards"},
                {title: "3 items", img: "https://public.digitalvalue.es:8789/alcantir/assets/62948d355099285515aecfdd?w=200", type: "3-cards"},
            ]
        },
        view:()=> {
            return  m(".ui.grid.three.columns",{
                            style: {padding: "1rem"}
                        }, [
                            plantillas.map( item => m(".column",{
                                    style:{
                                        cursor: "pointer",
                                        textAlign: "center",
                                    },
                                    onclick:()=>{
                                        selected = item
                                        if (templates[item.type]) {
                                            data.segments = [];
                                            data.segments = templates[item.type].segments
                                            data.name = templates[item.type].name + "-" + Math.floor(Date.now() / 1000)
                                            data.title = templates[item.type].title
                                        }
                                    }
                                },[
                                    m(".ui.image",
                                        m("img",{
                                            src: item.img,
                                            style: {
                                                height: '120px',
                                                border: selected == item ? "3px solid #74db74" : "none",
                                            }
                                        })
                                    ),
                                    m(".header", item.title)
                                ])
                            )
                        ])
        }
    }
}

function Revisions() {
    let historial = []
    return {
        oninit: ()=>{
            api_get(
                API +
                getRealm() +
                "/collections/paginas/" +
                pageData._id +
                "/revisions"
            )
            .then(response => {
               // console.log('Revisiones: ', response)
                if (Array.isArray(response.revisions) && response.revisions.length > 0) {
                    historial = response.revisions
                    //console.log('Historia: ', historial)
                }
            })
            .catch(error => {
                alert("Ha ocurrido un error, revisa la consola para mas informacion");
                console.error(error);
            });
        },

        view:({attrs})=>{
            if(historial.length == 0) return
            return [
                m(".ui.vertical.visible.sidebar.menu.right",[
                    m(".item",
                        m(".ui.mini.button",{
                            onclick: attrs.close
                        }, "Cerrar"),
                    ),
                    historial.map((revision, index) => {
                        return m("a.item",{
                            onclick:()=>{
                                    doAjax(
                                            API +
                                            getRealm() +
                                            "/collections/paginas/" +
                                    pageData._id
                                )
                                .then(page => {
                                    var revertedPage = page;
                                    //console.log('Page : ', page)
                                    //console.log('PageData : ', pageData)
                                    for (var i = 0; i <= index; i++) {
                                       // console.log(i)
                                        revertedPage = revert(revertedPage, historial[i]);
                                    }
                                    renderPage(revertedPage, 1);
                                })
                                .catch(error => console.error(error));
                            }
    
    
                            // onclick:()=>{
                            //     var revertedPage = pageData;
                            //     for (var i = 0; i <= index; i++) {
                            //         revertedPage = revert(revertedPage, historial[i]);
                            //     }
                            //     renderPage(revertedPage, 1);
                            // }
                        },new Date(revision.date).toLocaleDateString("es", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        }))
                    })
                ])
            ]
        }
    }

    function revert(page, revision) {
        revision.value.forEach(entry => {
            if (entry.length == 1) {
                _.unset(page, entry[0]);
            } else if (entry.length == 2) {
                _.set(page, entry[0], entry[1]);
            }
        });
        return page;
    }

}

function modals() {
    var modal = `
        <div class="ui tiny modal" id="editSizeModal">
            <i class="close icon"></i>
            <div class="ui segment">
                <div class="ui header">Edita el tamaño de la columna</div>
                <div class="content">
                    <div class="ui form">
                        <div class="field">
                            <label>Escribe la clase de la columna, p.ej. "six wide column"</label>
                            <input type="text" id="editSizeClass"/>
                        </div>
                        <div class="field">
                            <button class="ui button" onclick="saveDataSizeColumn();">Guardar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <div class="ui basic modal" id="saveEditedDataModal">
            <i class="close icon"></i>
            <div class="header">¿Seguro que desea sobreescribir los datos?</div>
            <div class="content">
                <button class="ui button" onclick="saveEditedPage();">Guardar</button>
            </div>
        </div>


        <div class="ui tiny modal" id="editContainerModal">
            <i class="close icon"></i>
            <div class="header">Edita el contenedor</div>
            <div class="content">
                <div class="ui form">
                    <div class="inline fields">
                        <label>Ancho del contenedor</label>
                        <div class="field">
                            <div class="ui radio checkbox">
                                <input type="radio" class="containerSize" name="size" data-size="ui container">
                                <label>Contenedor Centrado</label>
                            </div>
                        </div>
                        <div class="field">
                            <div class="ui radio checkbox">
                                <input type="radio" class="containerSize" name="size" data-size="ui fluid container">
                                <label>Ancho completo</label>
                            </div>
                        </div>
                        <div class="field">
                            <div class="ui radio checkbox">
                                <input type="radio" class="containerSize" name="size" data-size="ui text container">
                                <label>Reducido</label>
                            </div>
                        </div>
                    </div>
                    <!--<div class="ui small header">Atributos del contenedor</div>-->
                    <div class="field">
                        <!--<label>Clase</label>-->
                        <input type="text" id="containerClass" disabled />
                    </div>
                    <!--<div class="field">
                        <label>Style</label>
                        <input type="text" id="containerStyle" />
                    </div>-->
                    <div class="field">
                        <button class="ui button" onclick="saveDataSizeContainer();">Guardar</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="ui basic modal" id="deletePageModal">
            <i class="close icon"></i>
            <div class="header">¿Seguro que desea eliminar esta página?</div>
            <div class="content">
                <button class="ui red button" onclick="eliminarPagina(this.dataset.id);" data-id="" id="deletePageButton">Eliminar</button>
            </div>
        </div>

        <div class="ui fullscreen modal" id="editJSModal">
            <i class="close icon"></i>
            <div class="header">Edita Javascript personalizado</div>
            <div class="content">
                <div class="ui form">
                    <div class="field">
                        <label>Escribe tu Javascript aquí</label>
                        <div id="editJSText"></div>
                    </div>
                    <div class="field">
                        <button class="ui button" onclick="saveEditJS();">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Añadimos los modales que definen los componentes

    modal += componentModal();

    return modal;
}

async function importSegment(id, n) {
    if (!id || !n || (selectedItem.dataset.editor != "segment"))
        return;
    var json = await file_get_segment(`${id}#${n}`);
    var type = "";
    var path = selectedItem.dataset.path || "";
    var dataId = selectedItem.dataset.id || pageData.lastid;
    if (hasClass(selectedItem, "column")) type = "column";
    var segment = segment_render(type, json, path, 1);

    let segmentStyle = segment.querySelector("[data-component='style']")
    if(segmentStyle){
        let styledSegment = segmentStyle.innerHTML.replaceAll(segment.getAttribute('data-id'), dataId )
        segmentStyle.innerHTML = styledSegment
        //console.log("referSegment: ", styledSegment)
    }

    segment.dataset.id = dataId;
    selectedItem.replaceWith(segment);
}

async function referSegment(pageId, segment){
    if (!pageId || !segment.name || (selectedItem.dataset.editor != "segment"))
        return;
    const _ref = pageId + "#" + segment.name
    const className = selectedItem.className || "";
    let dataid = "";
    if(selectedItem.hasAttribute("data-id")){
        dataid = selectedItem.getAttribute('data-id')
    }
    const thumbnail = segment.thumbnail ? segment.thumbnail : "";
    const name = segment.name ? segment.name : "";
    const style = segment.style;
  //  console.log("referSegment: ", segment)
   replaceNodo({_ref, dataid,className, style, thumbnail, name })
}

// esta funcion se ha de ejecutar después de domcontentloaded
function editionInit() {
    var t = document.querySelector('#editionpane');
    var clone = document.importNode(t.content, true);
    document.body.insertBefore(clone, document.body.firstChild);

    /* Cargamos los menus modales de edición de segmento y componente, y los modales generales y los de componentes */
    $("#editElementModal").html(editElementModal());
    $("#modals").html(modals());

    // $("#selected-menu").html(createEditionMenu());

    var gutters = ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "CodeMirror-foldgutter"];

    CodeMirror(document.getElementById("editDataGraphForm"), {
        mode: "javascript",
        json: true,
        theme: "monokai",
        lineNumbers: true,
        lineWrapping: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        foldGutter: true,
        gutters,
        lint: true
    }).setSize(null, 600);
    CodeMirror(document.getElementById("editDataTableForm"), {
        mode: "javascript",
        json: true,
        theme: "monokai",
        lineNumbers: true,
        lineWrapping: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        foldGutter: true,
        gutters,
        lint: true
    }).setSize(null, 600);
    CodeMirror(document.getElementById("dataGallery"), {
        mode: "javascript",
        json: true,
        theme: "monokai",
        lineNumbers: true,
        lineWrapping: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        foldGutter: true,
        gutters,
        lint: true
    }).setSize(null, 500);

    // para gestionar los botones de adelante atras del navegador
    window.onpopstate = function(e) {
        if (e.state) {
            renderPage(e.state);
        }
    }

    // Gestionar deshacer y rehacer
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.key === 'z') {
            let f = undo.pop()
            if (typeof f === "function")
                f()
        }
    })

    //!!! no se porque pero en js no funciona, o funciona solo a veces
    //window.onbeforeunload = function(e){
    //   return 'Are you sure you want to leave?';
    //};

    $(window).bind('beforeunload', function() {
        //var nodo = document.getElementById('main').children;
        //var segments = segment_toJson(nodo);
        return false;
        return 'Are you sure you want to leave?';
    });

    editionMode();

    $("#elementInfoMessage .close").click(function() {
        console.log("click elementInfoMessage")
        $("#elementInfoMessage .content").toggle("slow");
    });
    $(".ui.dropdown").dropdown();

    // $(".ui.modal").modal({
    //     autofocus: false,
    //     closable: false
    // });

    var sizeInputs = document.querySelectorAll(".containerSize");
    for (var i = 0; i < sizeInputs.length; i++) {
        sizeInputs[i].addEventListener("click", function() {
            console.log("click containerSize")
            document.getElementById("containerClass").value = this.dataset.size;
        });
    }
}


/**
 * Cambiar la llamada con onclick!
 */
function FaviconWeb(){
    let faviconWeb, web;
    return{
        oninit:(vnode)=>{
            web = vnode.attrs.web;
            api_get(API + getRealm() + "/collections/webs?fields=web,favicon&web=" + web)
            .then(data => {
                if(data.items && data.itemsCount > 0 && data.items[0].favicon ){
                    faviconWeb = data.items[0].favicon
                }
            })
        },
        onupdate:(vnode)=>{
            if(web !== vnode.attrs.web){
                web = vnode.attrs.web;
                api_get(API + getRealm() + "/collections/webs?fields=web,favicon&web=" + web)
                .then(data => {
                    if(data.items && data.itemsCount > 0 && data.items[0].favicon ){
                        faviconWeb = data.items[0].favicon
                    }
                })
            }
        },

        view: ()=>{
            return m(".ui.action.left.mini.input",[
                    m("input",{ type: "text", value: faviconWeb}),
                    m("button.ui.mini.green.button",{
                        onclick: (e)=>{
                            console.log('Cambiar favicon de web', faviconWeb);

                            }
                        }, "Favicon WEB"
                    )
                ])
        }
    }
}

function goto(data) {

    // let el = document.querySelector(`[data-id='${data.dataid}']`)
    // if (!el && data.id)
    //     el = document.getElementById(data.id)
    // if (!el && data._ref)
    //     el = document.querySelector(`[data-ref='${data._ref}']`)
    // if (!el && data.name)
    //     el = document.querySelector(`[data-name='${data.name}']`)
    // else
    //   el = document.querySelector(`[data-id='${data.dataid}']`)

    let el = document.querySelector(`[data-name='${data}']`)

    if (el) {


        selectedItem = el
        el.scrollIntoView()

        // scroll({
        //     top: el.offsetTop - top - 60,
        //     behavior: "smooth"
        // })
        showEditionMenu()
    }
}


document.addEventListener("DOMContentLoaded", function() {

    // Comprobamos las variables creadas

    //console.log("contentloaded",window)

    login();

    document.addEventListener('ready',
        async function(e) {


            //!!!! esto debe ejecutarse solo después de haber cargado el usuario, sino realm es undefined
            if (window.location.search) {

               // console.log(window.location.search,window.location.hash)

                let pagename=window.location.search.substring(1) // Quitar ?
                let hash=window.location.hash.substring(1) // quitar #

                let found=false;
                pages = await readPages(getRealm())

                for(const id in pages) {

                    //console.log(pagename, id)

                    if (pages[id]===pagename || id===pagename) {

                        //console.log("IN")
                        cargarPagina({id})
                        .then(()=>{
                            removePageLoader()
                            if (hash) {
                                console.log("goto", hash)
                                // Ir al segmento indicado
                                // !!!
                                goto(hash)
                            }
                        })

                        return
                    }
                }
                //  console.log(pagename)
                // alert("NO EXISTE LA PÁGINA")
                // window.location.replace("./")

                if(confirm("No existe la página.")){
                    window.location.replace("./")
                }
            }
            /* Crea una página nueva a partir de un array de segmentos */
            else{
                //newPage("empty");
                //console.log('Inicio')
                //enderPage(templates["empty"]);
                removePageLoader()
                m.mount(document.getElementById("init-page"), {
                    view: ()=> m(".column", {
                            style: {
                                padding: "1rem",
                                position: "absolute",
                                left: "0",
                                top: "40px",
                                height: "calc(100vh - 40px)",
                                width: "100vw",
                                background: "#fff",
                                overflow: "auto",
                                zIndex: "999"
                            }
                        },[
                        m(".row", m("h2.ui.huge.header.centered",{
                                style: {marginBottom: "2rem"}
                            }, [
                                "¡Bienvenido ",
                                m("em", localStorage.user || USERDATA.username),
                                "!"
                            ])
                        ),
                        m(".ui.attached.segment",{style: {padding: "0rem",position: "relative"}},
                            m(".ui.padded.equal.width.grid",{style: {height: "100%", minHeight: "50vh"}}, [
                                m(GestorPaginas,{callback:()=>m.mount(document.getElementById("init-page"),null)}),
                            ]),
                        )
                    ])
                })
            }
    });

    editionInit();

   // console.log("PageData: ", pageData)

    m.mount(document.getElementById("edition"), {
       view: () => m(ZiTYBuilder)
    })

    // Botones de Edición del Segmento
    m.mount(document.getElementById("selected-menu-segment"), {
        view: () => m(SegmentEditionMenu,{
            key:selectedItem
        })
    })

    m.mount(document.getElementById('selected-menu'),{
        view:() => m(EditionMenu)
    })
    //console.log('start: ', pageData)
   // loadDependencies(pageData.webconf)
})


function JsonEdit() {
    let json
    return {
        oninit: ({attrs}) => {
            const { name, data} = attrs
            json = JSON.stringify(data[name], undefined, 4)
            //console.log("JsonEdit",json, data)
        },
        view: ({attrs}) => {
            const { data, name, rows, onchange, style } = attrs
            return [

                m("textarea", {
                    value: json,
                    style: {
                        width: "100%",
                        fontFamily: "Consolas, monospace",
                        overflow: "auto",
                        resize: "both",
                        spellcheck: "false",
                        fontSize: "11px",
                        ...style,
                    },
                    onclick: (e) => {
                        e.redraw = false
                        e.preventDefault()
                    },
                    oninput: (e) => json = e.target.value,
                    onchange: () => {
                        data[name] = JSON.parse(json)
                        if (onchange)
                        {
                            try {
                                onchange(JSON.parse(json))
                            }
                            catch (error) {
                                if(error instanceof SyntaxError) {
                                    alert('ERROR EN LA SINTAXIS JSON',error.messsage)
                                } else {
                                    throw error; // si es otro error, que lo siga lanzando
                                }
                            }
                        }
                    },
                    rows: rows || 20,
                })
            ]
        }
    }
}

function CopyToClipboard(){
    let copied = false;
    return {
        view: ({attrs})=>{
            return m(".ui.input", {
                className: "icon mini",
                style: {minWidth: "19em"}
            }, [
            m("input",{
                    type: "text",
                    value: attrs.tocopy,
                    style: {
                        pointerEvents: "none",
                        fontSize: ".9rem"
                    }
                }),
            m("button",{
                    className: "ui icon button basic right mini dark",
                    style: {
                        boxShadow: "unset!important",
                        marginLeft: "-30px",
                        borderLeft: "1px solid",
                        borderColor: "#ddd",
                        borderTopLeftRadius: "0",
                        borderBottomLeftRadius: "0",
                        marginRight: "0"
                    },
                    onclick: ()=>{
                        navigator.clipboard.writeText(attrs.tocopy)
                        copied = true
                        setTimeout(()=>{
                            copied=false;
                            m.redraw()
                        }, 1500)
                    }
                }, m("i.copy.icon" ,{
                    style: {
                        fontSize: ".9rem;",
                        color: "#464646",
                    }
                })),
                copied
            ? m(".ui.pointing.green.label.top", {
                    style: {
                        position: "absolute",
                        bottom: "-100%",
                        zIndex: "998"
                    },
                    },"copiado!")
                :null
            ])
        }
    }
}

function GestorPaginas() {
    let webs = {},
        selectedWeb,
        menu = [],
        selectedPage,
        editPageForm = false,
        newPageForm = false,
        webData,
        editWebData;
    let html


    //Tabular menu
    let tabMenu = 0

    function loadPaginas() {
        // return api_get(API + getRealm() + "/collections/paginas?limit=500&omit=segments,style,user-scripts,context&sort=section")
        return api_get(API + getRealm() + "/collections/paginas?limit=500&fields=title,name,section,web,description,favicon,templates,lastModificate,modificatedBy&sort=section")
        .then(function(data) {
            if (data.itemsCount && data.itemsCount > 0) {
                menu = []
                webs= {}
                data.items.map(function(item) {

                    if(!item._id) return
                    const webTitle = item.web ? item.web : 'Sin web';
                    let sectionTitle;
                    if(!!item.templates)
                        sectionTitle = "Plantillas"
                    else if(item.section)
                        sectionTitle = item.section
                    else sectionTitle = 'Sin Sección'

                    if(!webs[webTitle])
                        webs[webTitle] = {
                            items: [], 
                            pages: 0, 
                            sections: 0,
                            modificatedBy: '',
                            lastModificate: '',
                            modificatedPage: '',
                        };
                    if(!webs[webTitle].items[sectionTitle]){
                        webs[webTitle].items[sectionTitle] = [];
                        webs[webTitle].sections += 1;
                    }
                    // console.log(item.lastModificate, item.lastModificate > webs[webTitle].lastModificate)
                    // if(item.lastModificate){
                    //     const itemDate = new Date(item.lastModificate);
                    //     const dd = itemDate.toLocaleDateString('es-Es');
                    //     const hh = itemDate.toLocaleTimeString('es-Es');
                    //     if(webs[webTitle].lastModificate){

                    //     }else{
                    //         webs[webTitle].lastModificate = 
                    //     }

                    // }
                    if(item.lastModificate && item.lastModificate > webs[webTitle].lastModificate){
                        const date = new Date(item.lastModificate);
                        const dd = date.toLocaleDateString('es-Es');
                        const hh = date.toLocaleTimeString('es-Es');
                        webs[webTitle].lastModificate = item.lastModificate;
                        webs[webTitle].viewDate = dd + " " + hh;
                        webs[webTitle].modificatedBy = item.modificatedBy;
                        webs[webTitle].modificatedPage = item.name;
                    }

                    webs[webTitle].items[sectionTitle].push(item);
                    webs[webTitle].pages += 1;
                });
                menu = Object.keys(webs).sort()
            }
        });
    }

    const pagesClickHandler = async( el, pageId ) => {
        switch(el){
            case 'new-page': {
                editPageForm = false;
                selectedPage = null;
                editWebData = false;
                newPageForm = !newPageForm;
                break;
            }
            case 'web-config': {
                editPageForm = false;
                selectedPage = null;
                newPageForm = false;
                editWebData = !editWebData;
                break;
            }
            case 'edit-page': {
                editPageForm = !editPageForm;
                selectedPage = null;
                newPageForm = false;
                editWebData = false;

                selectedPage = await api_get(API + getRealm() + "/collections/paginas/" + pageId);
                html = "";
                segment_toHTML(selectedPage).then(res => {
                    html = res
                    m.redraw()
                });
                break;
            }
        }
        
    }

    return {
        oninit: async () =>{
            await loadPaginas();
            selectedWeb = pageData.web || 0;
            if(pageData.web){
                webData = await getWebData(getRealm(), pageData.web)
            }
            console.log(webs, webData)
        },
        view:({attrs})=>{
            const { callback } = attrs
            return [
                m(".three.wide.column",{style: {minWidth: "200px",padding:0,background: "rgb(247 247 247)"}
                    },[
                    m(".ui.vertical.tabular.menu",{
                        style: {
                            height: "100%",
                            width: "100%",
                            padding: "3px 0 0 7px",
                            margin: "0",
                        }
                    },[
                        m(".item",{
                            style: {
                                padding: "1rem .8em",
                                margin: "0",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }
                        },[
                            m(".header",{ style: { margin: "0" } },
                                m("code", "Proyectos"),
                            ),
                            m("button.ui.mini.icon.button", {
                                style: { 
                                    backgroundColor:"transparent"
                                },
                                title: "Crear nuevo proyecto",
                                onclick: async ()=>{
                                    const newWebName = prompt('Nombre del proyecto', 'Nuevo proyecto')
                                    if(newWebName && newWebName.trim().length > 3){
                                        const res = await createNewWeb(newWebName)
                                        if(res)
                                            loadPaginas()
                                    }
                                },
                            }, m("i.plus.icon")),                
                        ]),
                        menu.map( item => {
                            let itemClass = "";
                            if(selectedWeb == item){
                                itemClass = "active";
                                selectedWeb = item
                            }

                            return (
                                m("a.item", {
                                    style: {padding: "10px", fontWeight: item == pageData.web ? "600" : "400"},
                                    onclick: ()=>{
                                        editPageForm = false;
                                        newPageForm = false;
                                        selectedPage = null;
                                        selectedWeb = item
                                    },
                                    className: itemClass
                                },[
                                    item,
                                    m(".ui.label", webs[item].pages)
                                ])
                            )
                        })
                    ])
                ]),
                m(".seven.wide.column",{style: {height: "100%",overflow: "auto"}
                    },[
                    m(".row",[
                        selectedWeb ? [
                            [
                                {t: "Páginas", n: 'pages'},
                                {t: "Secciones", n: 'sections'}
                            ].map( item => (
                                    m(".ui.small.header",{
                                        style: {
                                            display: "inline-block", 
                                            margin: '0 1em 1em 0'
                                        }
                                    },
                                    m("code",
                                        `${item.t}: ${webs[selectedWeb][item.n]}`
                                    )
                                )
                            ))
                        ]: null,
                        
                    ]),

                    m(".row" ,{style: {marginBottom: "1rem"}},[
                        m(".ui.mini.primary.button",{
                            onclick: () => pagesClickHandler('new-page')
                        }, m("code", "+ Nueva Página")),
                        m("button.ui.mini.positive.button",{
                            onclick:() => pagesClickHandler('web-config')
                        }, [
                            m("i.cog.icon"),
                            m("code", "Configuración WEB")
                        ])
                    ]),
                    webs[selectedWeb] &&
                    webs[selectedWeb].viewDate ? [
                        m("",[
                            m("code", "Última modificación: "),
                            m("em",{
                                style: {
                                    color: '#a6a6a6',
                                    fontSize: '12px'
                                }
                            },
                                `${webs[selectedWeb].modificatedPage} - ${webs[selectedWeb].viewDate} ( ${ webs[selectedWeb].modificatedBy} )`
                            )
                        ]),
                    ]:null,
                    m("section",{ style: { columnCount: 2 }
                        },[
                        webs[selectedWeb] 
                        ? Object.keys(webs[selectedWeb].items).sort().map( section => {
                            const pages = webs[selectedWeb].items[section].sort((a,b) => a.name > b.name ? 1 : -1);
                            return (
                                m("article",{
                                        style: {
                                            padding: "1rem .5rem",
                                            flex: "0 0 50%",
                                            "-webkit-column-break-inside":"avoid"
                                        }
                                },[
                                    m(".header", section),
                                    m(".ui.small.list",[
                                        pages.map( page => {
                                            let isSelected = false;
                                            let modifyDate;
                                            if(selectedPage && selectedPage._id == page._id)
                                                isSelected = true;

                                            if(page.lastModificate){
                                                const date = new Date(page.lastModificate);
                                                const dd = date.toLocaleDateString('es-Es');
                                                const hh = date.toLocaleTimeString('es-Es');
                                                modifyDate = `${dd} ${hh} - ${page.modificatedBy}`
                                            }

                                            return (
                                                m(".item", {
                                                       
                                                        style:{
                                                            // backgroundColor: page._id == pageData._id ? "#ddd" : null,
                                                            border: "none",
                                                            marginBottom: "5px",
                                                            
                                                        }
                                                },[
                                                    m(".ui.small.basic.buttons",{ 
                                                        className: isSelected ? "green" : null,
                                                        style: {
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            backgroundColor: page._id == pageData._id ? "#ddd" : null,
                                                            border: "1px solid #ddd",
                                                        }
                                                    }, [
                                                    m("a.ui.button", {
                                                        style: {
                                                            textAlign: 'left',
                                                            width: 'calc(100% - 37px)',
                                                            whiteSpace: 'nowrap',
                                                            textOverflow: 'ellipsis',
                                                            overflow: 'hidden'
                                                        },
                                                        onclick: ()=> pagesClickHandler('edit-page', page._id),
                                                        ondblclick: () => {
                                                            if(callback && typeof callback == "function")
                                                                callback()
                                                            cargarPagina({id:page._id, edition:1})
                                                        }

                                                    },
                                                        page.name,
                                                    ),
                                                    m("a.ui.icon.button", {
                                                        onclick: ()=>{
                                                            if(callback && typeof callback == "function")
                                                                callback()
                                                            cargarPagina({id:page._id, edition:1})
                                                        }
                                                    },m("i.chevron.right.icon")),
                                                ]),
                                                    
                                                    modifyDate 
                                                    && m("em",{
                                                        style: {
                                                            float: "right",
                                                            color: '#a6a6a6',
                                                            fontSize: '10px'
                                                        }
                                                    }, modifyDate )
                                                ])
                                            )
                                        })
                                    ])
                                ])
                            )
                        }): null,
                        tabMenu == 1 && m(".header", "dependencias"),
                        tabMenu == 2 && m(".header", "favicon"),
                    ])
                ]),
                m(".six.wide.column", {
                        style: {
                            background: "#fff",
                            borderLeft: editPageForm || newPageForm ? "1px solid #ddd" : null,
                            padding: "0rem",
                        }
                    },  m("",{
                            style: {position: "sticky", top: "0", height: "calc(80vh - 13em)"}
                        },[
                            editPageForm
                            ? m(EditarPage)
                            : null,

                            newPageForm
                            ? m(NuevaPagina)
                            :null,

                            editWebData && m(WebConfig, {
                                web: webData, 
                                close: () => editWebData = null
                            })
                        ])
                    )
            ]
        }
    }

    function createNewWeb(name){

        let newWeb = templates.empty;

        newWeb.web = name;
        newWeb.segments = templates.empty.segments;
        newWeb.name = "nueva-pagina" + "-" + Math.floor(Date.now() / 1000);
        newWeb.title = templates.empty.title;
        newWeb.owners = new Array(USERDATA._id)

        return doAjax(API + getRealm() + "/collections/paginas/", "POST", "json" , newWeb)
            .then(function(data) {
                if(data){
                    ZityMessage({
                        success: true,
                        name: newWeb.title,
                        body: "creado"
                    });
                } else {
                    viewMainMessage("error", "Error en la conexión");
                }
                return data
            });
    }

    function NuevaPagina() {
        let newpage = {}

        function crearPagina() {
            newpage.owners = new Array(USERDATA._id)

            return doAjax(API + getRealm() + "/collections/paginas/", "POST", "json" , newpage)
                .then(function(data) {
                    if(data){
                        ZityMessage({
                            success: true,
                            name: data.name,
                            body: "creado"
                        });
                    } else {
                        viewMainMessage("error", "Error en la conexión");
                    }
                    return data
                });
        }

        return {
            oninit:()=>{
                newpage = {
                    section: "",
                    segments: [],
                    web: selectedWeb
                }
            },
            view:() =>  [
                    m('.ui.header.centered',{
                            style: {padding: "1rem 1rem 0"}
                        },"Crear nueva página"),
                    m(".ui.segment",{style: {backgroundColor: "rgb(247, 247, 247)"}},
                        m(TemplatePages, {
                            selectedWeb: selectedWeb,
                            data: newpage
                        })
                    ),
                    m(".column",{
                            style: {padding: "0 1rem"}
                        }, [
                        m(".ui.button", {
                            onclick:  ()=> newPageForm = false
                        }, "Cancelar"),
                        m(".ui.button.positive", {
                            onclick:async ()=>{
                                let res = await crearPagina();
                                if(res){
                                    loadPaginas()
                                    newPageForm = false
                                }
                            }
                        }, "Crear")
                    ])
                ]
        }
    }

    /**
    * Añadir animación en inicializacion y en cierre del componente
    */
    function EditarPage(){
        let tab = 1,
            changePageWebModal;

        function closeWindow(){
            editPageForm = false;
            selectedPage = null;
        }

        /**CLonar página */
        function clonarPagina() {
            let nuevaPagina = selectedPage;
            nuevaPagina.name += "-clone";
            nuevaPagina.title += "-clone";
            delete nuevaPagina._id;

            if (!nuevaPagina.owners || nuevaPagina.owners.lenght < 1) {
                nuevaPagina.owners = new Array(USERDATA._id);
            }

            return doAjax(API + getRealm() + "/collections/paginas", "POST", "json", nuevaPagina)
                .then(function(res) {
                    if (res) {
                        ZityMessage({
                            success: true,
                            name: res.name,
                            body: "creado"
                        });
                    } else {
                        viewMainMessage("error", "Error en la conexión");
                    }
                    return res
                });
        }

        /* Eliminar Pagina  */
        function eliminarPagina() {
            return doAjax(API + getRealm() + "/collections/paginas/" + selectedPage._id + "?force=true", "DELETE")
                .then(function(data) {
                    if(data){
                        ZityMessage({
                            success: true,
                            name: data.name,
                            body: "eliminado"
                        });
                    } else {
                        viewMainMessage("error", "Error en la conexión");
                    }
                    return data
                });
        }

        return{
            view:()=>{
                if(!selectedPage) return
                return  [
                        m(".ui.padded.equal.width.grid",{style:{borderBottom: "1px solid #ddd",padding: "0"}},[
                            m(".column",{style: {textAlign: "right",padding: "8px"}},[
                                m('button.ui.button.mini.primary',{
                                    onclick:()=>tab=0
                                    },[
                                        m("i.eye.icon"),
                                        "Previsualizar"
                                ]),
                                m('button.ui.button.mini.primary',{
                                    onclick:()=>tab=1
                                    },[
                                        m("i.edit.icon"),
                                        "Editar"
                                ]),
                                m('button.ui.button.mini.primary',{
                                    onclick: async ()=>{
                                        const res = await clonarPagina();
                                            if(res._id){
                                                loadPaginas()
                                                    .then(()=>{
                                                        closeWindow()
                                                    })
                                            }
                                        }
                                    },[
                                        m("i.clone.icon"),
                                        "Clonar"
                                ]),
                                m('button.ui.button.mini.negative',{
                                        onclick: async ()=>{
                                            if(!confirm("¿Eliminar página?\n"+ selectedPage.name)) return

                                            const res = await eliminarPagina();
                                            if(res._id){
                                                loadPaginas()
                                                    .then(()=>{
                                                        closeWindow()
                                                })
                                            }
                                        }
                                    }, [
                                        m("i.trash.icon"),
                                        "Eliminar"
                                ])
                            ]),
                        ]),
                        m(".column",{style: {padding: "1rem"}},[
                            m(".ui.tabular.top.attached.fluid.menu" ,[
                                ["Previsualizar","Info", "Dependencias", "Meta"]
                                .map((label, i) => {

                                    return m(".item",{
                                        style: {
                                            backgroundColor: tab == i ? "#f7f7f7" : ""
                                        },
                                        className: tab == i ? 'active' : '',
                                        onclick: ()=> tab = i
                                    }, label)
                                })
                            ]),
                            m(".ui.bottom.attached.segment",{
                                    style:{
                                        width: "calc(100% + 2px)",
                                        backgroundColor: "#f7f7f7"
                                    }
                                }, m(".ui.form",[
                                    tab === 0
                                    ? m(".ui.container",{style:"zoom:0.5",pointerEvents: "none"},m.trust(html))
                                    : tab == 1
                                    ? [
                                        m(".field", m(Input, {
                                            data: selectedPage,
                                            name: "title",
                                            label: "Titulo de página"
                                        })),
                                        m(".field", m(Input, {
                                            data: selectedPage,
                                            name: "name",
                                            label: "URI",
                                            onchange:(e)=>selectedPage.name = e.target.value.trim()
                                        })),
                                        m(".field", m(Input, {
                                            data: selectedPage,
                                            name: "section",
                                            label: "Sección"
                                        })),
                                        m(".field", m(Input, {
                                            data: selectedPage,
                                            name: "favicon",
                                            label: "Favicon",
                                            placeholder: "https://",
                                            onchange:(e)=>selectedPage.favicon = e.target.value.trim()
                                        })),
                                        m(".field",
                                        m("label", "ID página"),
                                        m(CopyToClipboard, {tocopy: selectedPage._id})
                                        ),
                                        m(".field", m(Checkbox, {
                                            data: selectedPage,
                                            name: "templates",
                                            label: "Página de plantillas"
                                        })),
                                        m(".field", 
                                            m("button.ui.tiny.primary.button",{
                                                onclick:()=>{
                                                    if(confirm("¿Deseas mover la pagina " + selectedPage.title + "?")){
                                                        changePageWebModal = true
                                                    }
                                                },
                                            }, "Mover a otra Web")
                                        ),
                                    ]
                                    :null,
                                    tab == 2
                                    ? m(".field", [
                                        m("label", "Dependencias (JS, CSS)"),
                                        m(JsonEdit, {
                                            name: "dependencies",
                                            data: selectedPage
                                        })
                                    ])
                                    :null,
                                    tab == 3
                                    ? [
                                        m(".field", m(Input, {
                                            placeholder: 'Resumen de página',
                                            data: selectedPage,
                                            name: "description",
                                            label: "Descripcción"
                                        })),
                                        m(".field", m(Input, {
                                            placeholder: 'Transparencia, datos abiertos, ayuntamiento',
                                            data: selectedPage,
                                            name: "keywords",
                                            label: "Palabras claves(separadas por comas)"
                                        }))
                                    ]
                                    :null,
                                    changePageWebModal 
                                    ? m("dialog",{
                                        style:{
                                            maxWidth: "500px",
                                            background: "transparent",
                                            border: "none",
                                        },
                                        oncreate:({dom}) => {
                                            dom.showModal()
                                        },
                                    }, m(".ui.segment", [
                                        m(".ui.header", "Selecciona la web a la cual quieres mover esta página"),
                                        Object.keys(webs).map( key => {
                                            if(key !== selectedPage.web)
                                            return (
                                                m("button.ui.basic.button", {
                                                    style:{margin: ".5em"},
                                                    onclick: async ()=>{
                                                        selectedPage.web = key;
                                                        changePageWebModal = null;
                                                        const res = await guardarPagina(selectedPage);
                                                        if(res && res._id) loadPaginas()
                                                    }
                                                },key)
                                            )
                                        })
                                    ]))
                                    :null 
                                ])
                            )

                        ]),
                        m(".column",{style: {padding: "0 1rem 1rem"}},[
                            m('button.ui.mini.button',{
                                onclick: ()=> closeWindow()
                            }, "Cancelar"),
                            m('button.ui.button.mini.positive',{
                                    onclick: async ()=>{
                                        const res = await guardarPagina(selectedPage);
                                        if(res && res._id) loadPaginas()
                                    }
                                }, [
                                    m("i.save.icon"),
                                    "Guardar"
                            ])
                        ])
                    ]
                // )
            }
        }
    }
}

function ColorLabel(){
    let colorPicker = false,
        selectedColor = ""
    return {
        view:({attrs})=>{
            return [
                m(".ui.label", {
                    onclick:()=>{
                        colorPicker = true
                    },
                    style: {
                        width: "32px",
                        height: "32px",
                        marginBottom: "-10px",
                        border: "1px solid #ddd",
                        backgroundColor: attrs.color
                    }
                }),
                colorPicker
                ? m("div",{
                        style: {
                            position: "absolute",
                            zIndex: "100",
                            left: "0",
                            right: "0",
                            top: "0",
                            bottom: "0",
                            background: "#fff",
                            border:"1px solid #ddd",
                            padding: "1rem"
                        }
                    },[
                        m("i.close.icon", {
                            style: {
                                position: "inherit",
                                right: 0
                            },
                            onclick: () => {
                                colorPicker = null
                            }
                        }),
                        m(ColorPicker, {
                            callback: (e) =>{
                                colorPicker = false;
                                attrs.callback(e);
                            },
                            selected: attrs.color
                        })
                ])
                :null,

            ]
        }
    }
}

function Button(){
    return {
        view:(vnode) => {
            const {className, href, callback, style, noBorder, title } = vnode.attrs
            let tag = "button"
            if(href)
                tag = "a"
            const css = {
                boxShadow: noBorder ? 'none' : null,
                border: noBorder ? 'none' : null,
                ...style
            }

            return m(`${tag}.ui.button`,{
                style: style || noBorder ? {
                    ...css
                }:null,
                title: title ? title : null,
                className: className ? className : null,
                href: href ? href : null,
                onclick:()=> {
                    if(typeof callback == 'function')
                        callback()
                }
            }, vnode.children)
        }
    }

}

function SelectedDropdown(){
    let dropdown = false,
        defaultValue = "",
        items = [];
    return {
        oninit:({attrs})=>{
            defaultValue = attrs.defaultValue
            items = attrs.items
        },
        view: ({attrs})=>{
            const { callback } = attrs
            return m(".ui.compact.selection.dropdown",{
                style: {zIndex: 1},
                tabindex: 0,
                onblur:()=> dropdown = false,
            },[
            m("i.dropdown.icon",{
                    onclick: ()=> dropdown = !dropdown
            }),
            m(".text", defaultValue),
            dropdown
            ?  m(".menu.transition.visible",{
                        style: {display: "block"}
                    }, items.map( item => {
                        if( item == defaultValue) return null
                        return m(".item",{
                                className: item == defaultValue ? "disabled" : null,
                                onclick:()=>{
                                    dropdown = false
                                    defaultValue = item
                                    if(typeof callback == 'function')
                                        callback(item)
                                }
                            }, item)
                    }))
            :null
        ])
        }
    }
}

function WebConfig () {
    let data;
    return {
        oninit:({attrs}) => {
            data = attrs.web
        },
        view: ({attrs}) => {
            console.log(attrs)
            const { web, api, cdn, dependencies, favicon } = data
            return (
                m("",{style: {display: "flex", flexDirection: "column", height: "100%"}},[
                    m("p", [
                        m("code", "Configuración web")
                    ]),
                    m("",{style: {flex: 1}},[
                        m("",[ 
                            m("p", "API"),
                            m(Input,{
                                data: data,
                                name: "api",
                                value: api,
                            })
                        ]),
                        m("", [
                            m("p", "CDN"),
                            m(Input,{
                                data: data,
                                name: "cdn",
                                value: cdn,
                            })
                        ]),
                        m("",[
                            m("p", "Favicon"),
                            m("img", {
                                src: data.favicon,
                                width: "64px"
                            }),
                            m(Input,{
                                data: data,
                                name: "favicon",
                                value: favicon,
                            }),
                        ]),
                        m("",[
                            m("p", "Dependencias"),
                            m(JsonEdit, {
                                name: "dependencies",
                                data: data,
                                value: dependencies,
                            })
                        ])
                    ]),
                    m("",[
                        m("button.ui.button", {
                                onclick: attrs.close
                            },  
                            m("code", "Cancelar")
                        ),
                        m("button.ui.button.positive", {
                                onclick: () => {
                                    viewMainMessage("positive", "¡Guardado!");
                                    attrs.close();
                                }
                            }, 
                            m("code", "Guardar")
                        )
                    ])
                ])
            )
        }
    }

}

