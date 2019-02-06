# Call-Graph-Exploration
Call-Graph-Exploration ist eine Webanwendung zu Exploration von Call Graphen


## Usage
Die [Webanwendung](https://martinkem.github.io/Call-Graph-Exploration/) liest den Graphen in Form einer JSON Datei ein. 

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

## Known Issues
