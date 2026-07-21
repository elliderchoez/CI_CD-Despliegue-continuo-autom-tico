pipeline {
    agent any

    // Definición de variables reutilizables para el pipeline
    environment {
        IMAGE_NAME = 'hola-mundo-node'
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
        CONTAINER_NAME = 'hola-mundo-node'
        PORT = '3000'
    }

    tools {
        nodejs "Node25" // Configura una instalación de Node.js en Jenkins
        dockerTool 'Dockertool'  // Cambia el nombre de la herramienta según tu configuración en Jenkins
    }

    stages {
        stage('Construir Imagen Docker') {
            steps {
                echo "Construyendo la imagen Docker: ${IMAGE_NAME}:${IMAGE_TAG}..."
                // Construye la imagen usando el build number como tag y también actualiza latest
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Ejecutar Contenedor Node.js') {
            steps {
                echo "Desplegando el contenedor ${CONTAINER_NAME} en el puerto ${PORT}..."
                sh """
                    # Detener y eliminar el contenedor previo si existe de forma silenciosa
                    if [ \$(docker ps -a -q -f name=^/${CONTAINER_NAME}\$) ]; then
                        echo "Deteniendo contenedor existente..."
                        docker stop ${CONTAINER_NAME} || true
                        docker rm ${CONTAINER_NAME} || true
                    fi

                    # Ejecutar el contenedor de la aplicación con reinicio automático
                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        --restart unless-stopped \
                        -p ${PORT}:${PORT} \
                        ${IMAGE_NAME}:latest
                """
            }
        }
    }

    // Acciones post-ejecución para limpieza e informes
    post {
        success {
            echo "¡El pipeline se completó con éxito! Aplicación corriendo en el puerto ${PORT}."
        }
        failure {
            echo "Hubo un error en el pipeline. Por favor, revisa los logs de consola de Jenkins."
        }
        always {
            // Limpieza del workspace de Jenkins al terminar la ejecución
            cleanWs()
        }
    }
}
