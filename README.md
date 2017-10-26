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

```
$ mvn generate-resources
$ cat > npm
#!/bin/sh
PATH="$PWD/node/":$PATH
node "node/node_modules/npm/bin/npm-cli.js" "$@"
$ chmod +x npm
$ ./npm install @angular/cli
```

and run `mvn generate-resources` again.

```
$ cat > ng
#!/bin/sh
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

No create an angular app:

```
$ ./ng new client
$ rm -rf client/node*
$ mv client/src tmp
$ mv client/* client/.??* .
$ rm -rf client
$ mv tmp client
$ sed -i -e 's,src,client,' .angular-cli.json
```

Add

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
$ ./ng version
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
$ ./ng e2e
...
[13:59:46] I/direct - Using ChromeDriver directly...
Jasmine started

  client App
    ✓ should display welcome message

Executed 1 of 1 spec SUCCESS in 0.718 sec.
[13:59:48] I/launcher - 0 instance(s) of WebDriver still running
[13:59:48] I/launcher - chrome #01 passed
```
