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

        stage('Node Build & Test') {
            steps {
                script {
                    docker.image('node:20-bullseye').inside('-u root:root') {
                        sh '''
                            npm ci
                            npm run lint
                            npm run test
                            npm run build
                        '''
                    }
                }
            }
        }

        stage('Semgrep Scan') {
            steps {
                script {
                    docker.image('semgrep/semgrep:latest').inside('-u root:root') {
                        sh '''
                            semgrep --config "${SEMGREP_RULESET}" --error --json > semgrep-report.json
                        '''
                    }
                }
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
