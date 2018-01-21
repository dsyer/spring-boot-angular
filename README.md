# Creating a New Application with Spring Boot and Angular

Spring Boot works great as a back end for an Angular application but it can be difficult to get the ball rolling. Most Spring users are comfortable with Java and the tools that are used to create and build the backend server. The front end can be written with plain old JavaScript as long as it is relatively simple, and you are willing to search for the rare examples and tutorials in this style. But these days you are much more likely to find documentation and tutorials that use tools like `Typescript`, `node.js`, `npm` and the Angular CLI.

This article shows you how to do that and keep your Spring Boot application intact. Much of the advice would apply equally well to other front end frameworks (anything that can be built using `npm` or similar). We use Maven, but similar tools are available for Gradle users. The goal is to have a single application that has Spring Boot and Angular, that can be built and developed by anyone who has knowledge of either ecosystem, and does not feel awkward or unidiomatic to either.

## Create a Spring Boot Application

Whatever you normally do to create a new Spring Boot application, do that. For example you could use your IDE features. Or you could do it on the command line:

```
$ curl start.spring.io/starter.tgz -d dependencies=web | tar -zxvf -
$ ./mvnw install
```

Now we'll take that application and add some Angular scaffolding. Before we can do anything with Angular, we have to install `npm`.

## Install Npm Locally

Installing `npm` is fraught with issues, including but not limited to how to get it working as part of your build automation. We are going to use the excellent [Maven Frontend Plugin](https://github.com/eirslett/frontend-maven-plugin) from Eirik Sletteberg. The first step is to add it to our `pom.xml`:

```
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
        <plugin>
            <groupId>com.github.eirslett</groupId>
            <artifactId>frontend-maven-plugin</artifactId>
            <version>1.6</version>
            <configuration>
                <nodeVersion>v8.8.1</nodeVersion>
            </configuration>
            <executions>
                <execution>
                    <id>install-npm</id>
                    <goals>
                        <goal>install-node-and-npm</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

and then

```
$ ./mvnw generate-resources
$ ls node*
```

Loads of stuff has been installed in the top level directory. Once the downloaded files are cached in your local Maven repository, it won't take long to run this for every build.

## Install Angular CLI

To build an Angular app these days it really helps to use the CLI provided by the Angular team. We can install it using the `npm` that we just got using the plugin. First create a convenient script to run `npm` from the local installation (in case you have others on your path):

```
$ cat > npm
#!/bin/sh
cd $(dirname $0)
PATH="$PWD/node/":$PATH
node "node/node_modules/npm/bin/npm-cli.js" "$@"
$ chmod +x npm
```

and then run it to install the CLI:

```
$ ./npm install @angular/cli
```

Then create a similar wrapper for the CLI itself, and test it quickly:

```
$ cat > ng
#!/bin/sh
cd $(dirname $0)
PATH="$PWD/node/":$PWD:$PATH
node_modules/@angular/cli/bin/ng "$@"
$ chmod +x ng
$ ./ng --version
_                      _                 ____ _     ___
   / \   _ __   __ _ _   _| | __ _ _ __     / ___| |   |_ _|
  / △ \ | '_ \ / _` | | | | |/ _` | '__|   | |   | |    | |
 / ___ \| | | | (_| | |_| | | (_| | |      | |___| |___ | |
/_/   \_\_| |_|\__, |\__,_|_|\__,_|_|       \____|_____|___|
           |___/
@angular/cli: 1.4.9
node: 8.8.1
os: linux x64
```

## Create an Angular App

The Angular CLI can be used to generate new application scaffolding, as well as other things. It's a useful starting point, but you could at this point grab any existing Angular app and put it in the same place. We want to work with the Angular app in a subdirectory of `src/main`, just to keep the source code tidy and make it look like a regular Maven build.

Create the app with the CLI and move it to `src/main`:

```
$ ./ng new client
$ rm -rf client/node* client/src/favicon.ico
$ mv client src/main
$ sed -i -e 's,dist,../../../target/classes/static,' src/main/client/.angular-cli.json
$ mv ng npm src/main/client
```

We discarded the node modules that the CLI installed because we want the frontend plugin to do that work for us in an automated build. We also edited the `.angular-cli.json` (a bit like a `pom.cxml` for the Angular CLI app) to point the output from the ANgular build to a location that will be packaged in our JAR file.

## Building

Add this to the frontend plugin configuration:

```
<workingDirectory>src/main/client</workingDirectory>
```

and add an execution to install the modules used in the application:

```
<execution>
    <id>npm-install</id>
    <goals>
        <goal>npm</goal>
    </goals>
</execution>
```

Install the modules again using `./mvnw generate-resources`.

```
$ src/main/client/ng version
_                      _                 ____ _     ___
   / \   _ __   __ _ _   _| | __ _ _ __     / ___| |   |_ _|
  / △ \ | '_ \ / _` | | | | |/ _` | '__|   | |   | |    | |
 / ___ \| | | | (_| | |_| | | (_| | |      | |___| |___ | |
/_/   \_\_| |_|\__, |\__,_|_|\__,_|_|       \____|_____|___|
           |___/
@angular/cli: 1.4.9
node: 8.8.1
os: linux x64
@angular/animations: 4.4.6
@angular/common: 4.4.6
@angular/compiler: 4.4.6
@angular/core: 4.4.6
@angular/forms: 4.4.6
@angular/http: 4.4.6
@angular/platform-browser: 4.4.6
@angular/platform-browser-dynamic: 4.4.6
@angular/router: 4.4.6
@angular/cli: 1.4.9
@angular/compiler-cli: 4.4.6
@angular/language-service: 4.4.6
typescript: 2.3.4
```

At this point, the tests work:

```
$ src/main/client/ng e2e
..
[13:59:46] I/direct - Using ChromeDriver directly...
Jasmine started

  client App
✓ should display welcome message

Executed 1 of 1 spec SUCCESS in 0.718 sec.
[13:59:48] I/launcher - 0 instance(s) of WebDriver still running
[13:59:48] I/launcher - chrome #01 passed
```

and if you add this as well:

```
    <execution>
        <id>npm-build</id>
        <goals>
            <goal>npm</goal>
        </goals>
        <configuration>
            <arguments>run-script build</arguments>
        </configuration>
    </execution>
```

then the client app will be compiled during the Maven build.

## Development Time

You can build continuously with

```
$ src/main/client/ng build --watch
```

Updates are built (quickly) and pushed to `target/classes` where they can be picked up by Spring Boot. Your IDE might need to be tweaked to pick up the changes automatically (Spring Tool Suite does it out of the box).

That's it really, but we can quickly look into a couple of extra things that will get you off the ground quickly with Spring Boot and Angular.

### VSCode

https://code.visualstudio.com/[Microsoft VSCode] is quite a good tool for developing JavaScript applications, and it also has good support for Java and Spring Boot. If you install the "Java Extension Pack" (from Microsoft), the "Angular Essentials" (from Jon Papa) and the "Latest TypeScript and JavaScript Grammar" (from Microsoft) you will be able to do code completion and source navigation in the Angular app (all those extensions and discoverable from the IDE). There are also some Spring Boot features that you need to download and install (in Extensions view click on top right and choose `Install from VSIX...`) at http://dist.springsource.com/snapshot/STS4/nightly-distributions.html.

What VSCode doesn't have currently is automatic detection of `npm` build tools in *subdirectories* (and ours is in `src/main/client`). So to build from the IDE you need to add a `.vscode/tasks.json` something like this:

```
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "ng-build",
            "type": "shell",
            "command": "src/main/client/ng build"
        },
        {
            "label": "ng-watch",
            "type": "shell",
            "command": "src/main/client/ng build --watch"
        }
    ]
}
```

With that in place your `Tasks->Run Task...` menu should include the `ng-watch` option, and it will run the angular build for you and re-compile if you make changes. You could add other entries for running tests.

## Adding Bootstrap

You can add basic Twitter Bootstrap features to make the app look a bit less dull (taken from [this blog](https://medium.com/codingthesmartway-com-blog/using-bootstrap-with-angular-c83c3cee3f4a)):

```
$ src/main/client/npm install bootstrap@3 jquery --save
```

and update `.angular-cli.json` to add the new content:

```
  "styles": [
"styles.css",
"../node_modules/bootstrap/dist/css/bootstrap.min.css"
  ],
  "scripts": [
"../node_modules/jquery/dist/jquery.min.js",
"../node_modules/bootstrap/dist/js/bootstrap.min.js"
  ],
```

## Basic Angular Features

Some basic features are included in the default scaffolding app, including the HTTP client, HTML forms support and navigation using the `Router`. All of them are extremely well documented at [angular.io](https://angular.io), and there are thousands of examples out in the internet of how to use those features.

As an example, lets look at how to add an HTTP Client call, and hook it up to a Spring `@RestController`. In the front end `app-root` component we can add some placeholders for dynamic content:

app.component.html:
```html
<div style="text-align:center"class="container">
  <h1>
    Welcome {{title}}!
  </h1>
  <div class="container">
    <p>Id: <span>{{data.id}}</span></p>
    <p>Message: <span>{{data.content}}</span></p>
  </div>
</div>
```

so we are looking for a `data` object in the scope of the component:

app.component.ts:
```javascript
import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Demo';
  data = {};
  constructor(private http: HttpClient) {
    http.get('resource').subscribe(data => this.data = data);
  }
}
```

Notice how the `AppComponent` has an `HttpClient` injected into its constructor. In the module definition we need to import the `HttpClientModule` as well, to enable the dependency injection:

app.module.ts
```javascript
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

In our Spring Boot application we need to service the `/resource` request and return an object with the right keys for the client:

DemoApplication.java:
```java
@SpringBootApplication
@Controller
public class DemoApplication {

  @GetMapping("/resource")
  @ResponseBody
  public Map<String, Object> home() {
    Map<String, Object> model = new HashMap<String, Object>();
    model.put("id", UUID.randomUUID().toString());
    model.put("content", "Hello World");
    return model;
  }

...

}
```

If you look at the source code [in Github](https://github.com/dsyer/spring-boot-angular) you will also notice that there is a test for the backend interaction in `app.component.spec.ts` (thanks to [this Ninja Squad blog](http://blog.ninja-squad.com/2017/07/17/http-client-module/)). The `pom.xml` has been modified to run the Angular e2e tests at the same time as the Java tests.

## Conclusion

We have created a Spring Boot application, added a simple HTTP endpoint to it, and then added a front end to it using Angular. The Angular app is self-contained, so anyone who knows the tools can work with it from its own directory. The Spring Boot application folds the Angular assets into its build and a developer can easily update and test the front end from a regular IDE by running the app in the usual way.
