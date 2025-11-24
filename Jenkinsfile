pipeline {
    agent {
        docker {
            image 'agustinpose/devsecops-agent:latest'
            args '-u root -v /var/run/docker.sock:/var/run/docker.sock'
        }
    }
    options {
        timestamps()
    }

    stages {

        stage('Semgrep Static Analysis') {
            steps {
                sh '''
                echo "Running Semgrep..."
                semgrep scan --config=semgrep_rules.yaml .
                '''
            }
        }

        stage('Snyk Dependency Scan') {
            steps {
                withCredentials([string(credentialsId: 'SNYK_TOKEN', variable: 'SNYK_TOKEN')]) {
                    sh '''
                    echo "Running Snyk..."
                    snyk auth $SNYK_TOKEN
                    snyk test --all-projects
                    '''
                }
            }
        }

        stage('Build Frontend') {
            steps {
                sh '''
                echo "Building frontend..."
                npm install
                npm run build
                '''
            }
        }

        stage('Build Backend') {
                steps {
                    sh '''#!/bin/bash
                    set -e
                    echo "Installing backend dependencies..."
                    cd backend
                    source /opt/backend-venv/bin/activate
                    pip install -r requirements.txt
                    '''
                }
                }

        stage('Docker Build & Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'DOCKER_HUB',
                                                  usernameVariable: 'DOCKER_USER',
                                                  passwordVariable: 'DOCKER_PASS')]) {

                    sh '''
                    echo "Logging into Docker Hub..."
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                    echo "Building Docker image..."
                    docker build -t $DOCKER_USER/senseibird:latest .

                    echo "Pushing Docker image..."
                    docker push $DOCKER_USER/senseibird:latest
                    '''
                }
            }
        }

        stage('Helm Deploy') {
            steps {
                withCredentials([file(credentialsId: 'KUBECONFIG_PORTABLE', variable: 'KCFG')]) {
                    sh '''
                    echo "Deploying to Kubernetes with Helm..."
                    export KUBECONFIG="$KCFG"
                    helm upgrade --install senseibird ./helm \
                      --namespace senseibird \
                      --create-namespace \
                      --values helm/values.yaml
                    '''
                }
            }
        }

    }
}
