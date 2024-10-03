# Intelligent lighting control system

Developed using nodejs

It is divided into multiple modules and runs on different servers for disaster preparedness and load balancing to ensure system availability



Use technology

Express: Used as a web framework and using the art-template template engine to create a front-end user interface

node-red: Used to simulate the sensors, lights and other iot devices needed in the project

aws ec2,mongodb:ec2 is used as a server to run the project, and mongodb is used as a database to store user information and related operation data





## Module

Modules are extensible

web Module: It is used to display lighting information and control light color and switch for users, control the lighting schedule (for example, set the lights automatically on at 6 p.m. every day, and the lights automatically off at 12 a.m.), and control the lighting mode (users can preset a variety of lighting scenes, such as "movie mode" to dim the living room lights, or "party mode" to turn on colorful lighting effects. Scenarios can be activated by application selection or automatically triggered by setting specific conditions.)



Sensor module: Used to receive and send mqtt messages from sensors (light sensors measure ambient light levels and adjust lighting accordingly). Motion sensors detect motion to control lights on and off or adjust intensity



Light module: Used to receive and send mqtt messages that control lights





## Scalability

Each module uses ec2 deployment for load balancing and disaster preparedness via aws application load balancers, with at least two EC2s per module to ensure availability

Achieve elastic scaling with auto scaling and configure cloudwatch alerts to alert servers to scaling changes via email



## Intelligent

Users can configure the schedule to control the lighting on and off time according to the predefined scene automatic lighting





