pipeline {
    agent any
    options {
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Semgrep Static Analysis') {
            steps {
                sh '''
                echo "Running Semgrep..."
                ls -lah .
                echo "Contenido de semgrep_rules.yaml:"
                cat semgrep_rules.yaml

                docker run --rm \
                -v $WORKSPACE:/src \
                -w /src \
                semgrep/semgrep \
                semgrep scan --config=/src/semgrep_rules.yaml /src
                '''
            }
        }


    }
}
