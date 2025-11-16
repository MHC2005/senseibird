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

        stage('Semgrep Scan') {
            steps {
                sh '''
                    python3 -m pip install --user --upgrade semgrep
                    export PATH="$HOME/.local/bin:$PATH"
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
