pipeline {
    agent any

    options {
        timestamps()
        skipDefaultCheckout(true)
    }

    environment {
        NODE_ENV = 'production'
        SEMGREP_RULESET = 'semgrep_rules.yaml'
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
                    sh """
                        set -e
                        docker run --rm \\
                          -v "${env.WORKSPACE}":/workspace \\
                          -w /workspace \\
                          node:20-bullseye \\
                          bash -lc "npm ci && npm run lint && npm run test && npm run build"
                    """
                }
            }
        }

        stage('Semgrep Scan') {
            steps {
                script {
                    sh """
                        set -e
                        docker run --rm \\
                          -v "${env.WORKSPACE}":/workspace \\
                          -w /workspace \\
                          -e SEMGREP_RULESET="${env.SEMGREP_RULESET}" \\
                          semgrep/semgrep:latest \\
                          bash -lc "semgrep --config \\${SEMGREP_RULESET} --error --json > semgrep-report.json"
                    """
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
