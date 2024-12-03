def app

pipeline {
    agent any
    environment {
        ENV_TYPE = "production"
        PORT = 3689
        NAMESPACE = "smart-reg-org-ru"
        REGISTRY_HOSTNAME = "itlearning644"
        PROJECT = "backend-smart-team"
        REGISTRY = "registry.hub.docker.com"
        DEPLOYMENT_NAME = "backend-smart-team-deployment"
        IMAGE_NAME = "${env.BUILD_ID}_${env.ENV_TYPE}_${env.GIT_COMMIT}"
        DOCKER_BUILD_NAME = "${env.REGISTRY_HOSTNAME}/${env.PROJECT}:${env.IMAGE_NAME}"
    }

    stages {
        stage('Clone repository') {
            steps {
                checkout scm
            }
        }
        stage('Unit tests') {
            steps {
                script {
                    sh '''
                       export NVM_DIR="$HOME/.nvm"
                       [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                       nvm use --lts
                       yarn install
                       yarn test
                    '''
                }
            }
        }
        stage('e2e tests') {
            steps {
                script {
                    sh '''
                       export NVM_DIR="$HOME/.nvm"
                       [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                       nvm use --lts
                       yarn test:e2e
                    '''
                }
            }
        }
        stage('Build docker image') {
            steps {
                echo "Build image started..."
                    script {
                        app = docker.build("${env.DOCKER_BUILD_NAME}")
                    }
                echo "Build image finished..."
            }
        }
        stage('Push docker image') {
             steps {
                 echo "Push image started..."
                     script {
                        docker.withRegistry("https://${env.REGISTRY}", 'smart-reg-org-ru') {
                            app.push("${env.IMAGE_NAME}")
                        }
                     }
                 echo "Push image finished..."
             }
       }
       stage('Delete image local') {
             steps {
                 script {
                    sh "docker rmi -f ${env.DOCKER_BUILD_NAME}"
                 }
             }
        }
        stage('Preparing deployment') {
             steps {
                 echo "Preparing started..."
                     sh 'ls -ltr'
                     sh 'pwd'
                     sh "chmod +x preparingDeploy.sh"
                     sh "./preparingDeploy.sh ${env.REGISTRY_HOSTNAME} ${env.PROJECT} ${env.IMAGE_NAME} ${env.DEPLOYMENT_NAME} ${env.PORT} ${env.NAMESPACE}"
                     sh "cat deployment.yaml"
             }
        }
        stage('Deploy to Kubernetes') {
             steps {
                 withKubeConfig([credentialsId: 'prod-kubernetes']) {
                    sh 'kubectl apply -f deployment.yaml'
                    sh "kubectl rollout status deployment/${env.DEPLOYMENT_NAME} --namespace=${env.NAMESPACE}"
                    sh "kubectl get services -o wide"
                 }
             }
        }
    }
}
