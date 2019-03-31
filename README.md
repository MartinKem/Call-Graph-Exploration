Diese README richtet sich an die Nutzer und Weiterentwickler der Call-Graph-Exploration Anwendung.

# Call-Graph-Exploration
Call-Graph-Exploration ist eine Webanwendung zu Exploration von Call Graphen


## Usage
Die [Webanwendung](https://martinkem.github.io/Call-Graph-Exploration/), die in erster Linie für Google Chrome geschrieben ist, liest den Graphen in Form einer JSON Datei ein. 

### JSON
Die JSON Datei muss zum aktuellem Stand einige Bedingungen erfüllen.

* Das erste Attribut des Knoten muss "method" sein
* Die Datei als Unix (LF) gespeichert
* _UTF-8 empfohlen_

#### Beispiel JSON
    {
      "reachableMethods" : [ {
        "method" : {
          "name" : "<init>",
          "declaringClass" : "Ltmr/Demo;",
          "returnType" : "V",
          "parameterTypes" : [ ]
        },
        "callSites" : [ {
          "declaredTarget" : {
            "name" : "<init>",
            "declaringClass" : "Ljava/lang/Object;",
            "returnType" : "V",
            "parameterTypes" : [ ]
          },
          "line" : 17,
          "targets" : [ {
            "name" : "<init>",
            "declaringClass" : "Ljava/lang/Object;",
            "returnType" : "V",
            "parameterTypes" : [ ]
          } ]
        }, {
          "declaredTarget" : {
            "name" : "verifyCall",
            "declaringClass" : "Ltmr/Demo;",
            "returnType" : "V",
            "parameterTypes" : [ ]
          },
          "line" : 18,
          "targets" : [ {
            "name" : "verifyCall",
            "declaringClass" : "Ltmr/Demo;",
            "returnType" : "V",
            "parameterTypes" : [ ]
          } ]
        } ]
      }, {...}, ...
      ]}

### Hinweis zu möglichen erweiterung der Anwendung, zum einlesen von Graphen ohne JSON Datei
Es ist vorstellbar die Anwendung so zu erweitern, dass eine Schnittelle für andere Programme existiert um die Graphendaten direkt an die Anwendung zu geben, ohne diese erst in eine JSON Datei zu schreiben.
Um die Graphdaten direkt in die Map der Anwendung zu schreiben muss einiges beachtet werden um gleiches verhalten zu erwarten.

1. Die globalen Variablen `totalNodes` und `totalEdges` manuell setzen (sind nicht nötig um die Grundfunktionalitäten der Anwendung zu gewährleisten)
2. `changeDiv()` muss aufgerufen werden um die Ansicht vom Ladebildschirm auf die Graphenexploration zu ändern.
3. Suche aktivieren `document.getElementById("search").removeAttribute("disabled")`
4. Nach dem befüllen der Map  autocomplete aktivieren `var fullMethods = getStructuredMethodList(); autocomplete(document.getElementById("searchInput"), fullMethods);`
5. Beim befüllen der Map: 
	1. Map erstellen: `parsedJsonMap = new Map()`
	2. Dann Knoten einfügen: mit `addJsonMapEntry(element)` oder `parsedJsonMap.set(idString(element.method), element);`, `element` ist ein Javascript Object mit den Attributen wie die Elemente der `reachableMethods` in den JSON Daten

## Fremdcode
Fremdcode: jquery.min.js, d3.v3.min.js
https://jquery.org/license/
https://github.com/d3/d3/blob/master/LICENSE
