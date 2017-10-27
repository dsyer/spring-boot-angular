## Install npm Locally

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

then

```
$ mvn generate-resources
$ ls node*
```

## Install Angular CLI

```
$ cat > npm
#!/bin/sh
cd $(dirname $0)
PATH="$PWD/node/":$PATH
node "node/node_modules/npm/bin/npm-cli.js" "$@"
$ chmod +x npm
$ ./npm install @angular/cli
```

and run `mvn generate-resources` again.

```
$ cat > ng
#!/bin/sh
cd $(dirname $0)
PATH="$PWD/node/":$PATH
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

Create the app with the CLI and move it to `src/main`:

```
$ ./ng new client
$ rm -rf client/node* client/src/favicon.ico
$ mv client src/main
$ sed -i -e 's,dist,../../../target/classes/static,' src/main/client/.angular-cli.json
$ mv ng npm src/main/client
```

## Building

Add

```
<configuration>
    <workingDirectory>src/main/client</workingDirectory>
</configuration>
```

and

```
    <execution>
        <id>npm-install</id>
        <goals>
            <goal>npm</goal>
        </goals>
        <configuration>
            <arguments>install</arguments>
        </configuration>
    </execution>
```

Install the modules again using `mvn generate-resources`.

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

And the tests work:

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

Add

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

and then the client app will be compiled during the Maven build.

You can build continuously with

```
$ src/main/client/ng build --watch
```

Updates are built (quickly) and pushed to `target/classes` where they can be picked up by Spring Boot.

## Adding Bootstrap

https://medium.com/codingthesmartway-com-blog/using-bootstrap-with-angular-c83c3cee3f4a

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
