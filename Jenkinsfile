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
            sh """
            echo "Running Semgrep..."
            semgrep --config semgrep_rules.yaml || true
            """
        }
    }

    stage('Snyk Dependency Scan') {
        withCredentials([string(credentialsId: 'snyk-token', variable: 'SNYK_TOKEN')]) {
            sh '''
                echo "Running Snyk scan..."
                docker run --rm \
                    -e SNYK_TOKEN=$SNYK_TOKEN \
                    -v $WORKSPACE/backend:/project \
                    snyk/snyk:python \
                    test --file=/project/requirements.txt || true
            '''
        }
    }



  }
}
