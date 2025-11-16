pipeline {
    agent any

    options {
        timestamps()
        skipDefaultCheckout(true)
    }

    environment {
        NODE_ENV = 'production'
        SEMGREP_RULESET = "${WORKSPACE}/semgrep_rules.yaml"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Node CI') {
            agent {
                docker {
                    image 'node:20-bullseye'
                    args '-u root:root'
                }
            }
            stages {
                stage('Install dependencies') {
                    steps {
                        sh 'npm ci'
                    }
                }

                stage('Lint') {
                    steps {
                        sh 'npm run lint'
                    }
                }

                stage('Test') {
                    steps {
                        sh 'npm run test'
                    }
                }

                stage('Build') {
                    steps {
                        sh 'npm run build'
                    }
                }
            }
        }

        stage('Semgrep Scan') {
            agent {
                docker {
                    image 'semgrep/semgrep:latest'
                    args '-u root:root'
                }
            }
            steps {
                sh '''
                    semgrep --config "${SEMGREP_RULESET}" --error --json > semgrep-report.json
                '''
                archiveArtifacts artifacts: 'semgrep-report.json', fingerprint: true
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
    }
}
