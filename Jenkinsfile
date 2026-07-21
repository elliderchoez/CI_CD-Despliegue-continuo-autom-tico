pipeline {
    agent any

    tools {
        nodejs "Node25" // Configura la instalación de Node.js
        dockerTool 'Dockertool' // Integrado de tu primer código para que Jenkins reconozca Docker
    }

    stages {
        stage('Instalar dependencias') {
            steps {
                sh 'npm install'
            }
        }

        stage('Ejecutar tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Construir Imagen Docker') {
            when {
                // Solo se ejecuta si los tests y la instalación fueron exitosos
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                sh 'docker build -t hola-mundo-node:latest .'
            }
        }

        stage('Ejecutar Contenedor Node.js') {
            when {
                // Solo se ejecuta si la construcción de la imagen fue exitosa
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                sh '''
                    # Detener y eliminar cualquier contenedor previo
                    docker stop hola-mundo-node || true
                    docker rm hola-mundo-node || true

                    # Ejecutar el nuevo contenedor de la aplicación
                    docker run -d --name despliege-continuo -p 3000:3000 despliege-continuo:latest
                '''
            }
        }
    }
}
